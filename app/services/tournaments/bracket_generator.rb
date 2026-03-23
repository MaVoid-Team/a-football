module Tournaments
  class BracketGenerator
    def initialize(tournament:)
      @tournament = tournament
    end

    def call
      @tournament.with_lock do
        return ServiceResult.failure("Bracket already exists", error_codes: [:bracket_exists]) if @tournament.bracket_data.present? && @tournament.bracket_data["rounds"].present?

        case @tournament.tournament_type
        when "knockout"
          generate_knockout
        when "round_robin"
          generate_round_robin
        when "group_knockout"
          generate_group_knockout
        else
          ServiceResult.failure("Bracket generation for this tournament type is not implemented yet", error_codes: [:not_implemented])
        end
      end
    end

    private

    def generate_knockout
      teams = source_teams
      return ServiceResult.failure("At least 2 participants are required", error_codes: [:insufficient_participants]) if teams.size < 2

      randomized = teams.shuffle
      bracket_size = next_power_of_two(randomized.size)
      byes = bracket_size - randomized.size
      seeded = randomized + Array.new(byes)

      rounds = []
      first_round_matches = []
      seeded.each_slice(2).with_index(1) do |pair, idx|
        bye = pair[0].present? && pair[1].nil?
        first_round_matches << {
          round_number: 1,
          match_number: idx,
          team1_id: pair[0]&.id,
          team2_id: pair[1]&.id,
          winner_id: bye ? pair[0].id : nil,
          status: bye ? "completed" : "pending"
        }
      end
      rounds << { round_number: 1, matches: first_round_matches }

      matches_count = first_round_matches.size
      round_number = 2
      while matches_count > 1
        matches_count /= 2
        rounds << {
          round_number: round_number,
          matches: (1..matches_count).map do |match_no|
            {
              round_number: round_number,
              match_number: match_no,
              team1_id: nil,
              team2_id: nil,
              winner_id: nil,
              status: "pending"
            }
          end
        }
        round_number += 1
      end

      persist_bracket(rounds)
    end

    def generate_round_robin
      teams = source_teams
      return ServiceResult.failure("At least 2 participants are required", error_codes: [:insufficient_participants]) if teams.size < 2

      matches = []
      round = 1
      teams.combination(2).each_with_index do |(team1, team2), idx|
        matches << {
          round_number: round,
          match_number: idx + 1,
          team1_id: team1.id,
          team2_id: team2.id,
          winner_id: nil,
          status: "pending"
        }
      end

      persist_bracket([{ round_number: 1, matches: matches }])
    end

    def generate_group_knockout
      teams = source_teams
      return ServiceResult.failure("At least 4 participants are required", error_codes: [:insufficient_participants]) if teams.size < 4

      group_count = recommended_group_count(teams.size)
      groups = distribute_into_groups(teams.shuffle, group_count)

      rounds = []
      group_matches = []
      group_meta = []
      group_match_number = 1

      groups.each_with_index do |group_teams, idx|
        group_name = "Group #{("A".ord + idx).chr}"
        group_meta << {
          name: group_name,
          team_ids: group_teams.map(&:id),
          qualifiers: 1,
          tiebreak_order: ["points", "wins", "team_id"],
          standings: [],
          qualified_team_ids: []
        }

        group_teams.combination(2).each do |team1, team2|
          group_matches << {
            round_number: 1,
            match_number: group_match_number,
            team1_id: team1.id,
            team2_id: team2.id,
            winner_id: nil,
            status: "pending",
            stage: "group",
            group_name: group_name
          }
          group_match_number += 1
        end
      end

      rounds << { round_number: 1, stage: "group", groups: group_meta, matches: group_matches }

      knockout_seeds = groups.each_index.map do |idx|
        "#{("A".ord + idx).chr}1"
      end

      knockout_round_number = 2
      current_seeds = knockout_seeds
      while current_seeds.size > 1
        next_round_size = current_seeds.size / 2
        knockout_matches = []

        (0...next_round_size).each do |i|
          knockout_matches << {
            round_number: knockout_round_number,
            match_number: i + 1,
            team1_id: nil,
            team2_id: nil,
            winner_id: nil,
            status: "pending",
            stage: "knockout",
            seed1: current_seeds[i],
            seed2: current_seeds[current_seeds.size - 1 - i]
          }
        end

        rounds << { round_number: knockout_round_number, stage: "knockout", matches: knockout_matches }
        current_seeds = (1..next_round_size).map { |n| "W#{knockout_round_number}-#{n}" }
        knockout_round_number += 1
      end

      persist_bracket(rounds)
    end

    def persist_bracket(rounds)
      payload = {
        generated_at: Time.current,
        tournament_type: @tournament.tournament_type,
        rounds: rounds
      }

      Tournament.transaction do
        @tournament.update!(bracket_data: payload)
        rounds.each do |round|
          round[:matches].each do |match|
            TournamentMatch.find_or_create_by!(
              tournament_id: @tournament.id,
              round_number: match[:round_number],
              match_number: match[:match_number]
            ) do |record|
              record.team1_id = match[:team1_id]
              record.team2_id = match[:team2_id]
              record.winner_id = match[:winner_id]
              record.status = match[:status]
            end
          end
        end

        # Auto-advance byes generated in earlier rounds.
        propagate_precompleted_winners!
      end

      ServiceResult.success(@tournament)
    end

    def source_teams
      teams = @tournament.tournament_teams.active.to_a
      return teams if teams.any?

      @tournament.tournament_registrations
                 .approved
                 .includes(:player)
                 .map(&:player)
                 .compact
                 .map do |player|
        @tournament.tournament_teams.find_or_create_by!(player1_id: player.id, player2_id: nil) do |team|
          team.name = player.name
          team.status = :active
        end
      end
    end

    def propagate_precompleted_winners!
      @tournament.tournament_matches.completed.where.not(winner_id: nil).find_each do |match|
        next_match = @tournament.tournament_matches.find_by(
          round_number: match.round_number + 1,
          match_number: ((match.match_number - 1) / 2) + 1
        )
        next unless next_match

        slot = match.match_number.odd? ? :team1_id : :team2_id
        next_match.update!(slot => match.winner_id)
      end
    end

    def next_power_of_two(number)
      value = 1
      value *= 2 while value < number
      value
    end

    def recommended_group_count(team_count)
      return 2 if team_count <= 8
      return 4 if team_count <= 16

      8
    end

    def distribute_into_groups(teams, group_count)
      groups = Array.new(group_count) { [] }
      teams.each_with_index do |team, idx|
        groups[idx % group_count] << team
      end
      groups
    end
  end
end
