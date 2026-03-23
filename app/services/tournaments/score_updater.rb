module Tournaments
  class ScoreUpdater
    def initialize(match:, winner_id:, score: {})
      @match = match
      @winner_id = winner_id.to_i
      @score = score || {}
    end

    def call
      return failure("match_not_scoreable", "Match cannot be scored in its current status") unless scoreable_status?
      return failure("invalid_winner", "Winner must be one of the match teams") unless [@match.team1_id, @match.team2_id].include?(@winner_id)

      ActiveRecord::Base.transaction do
        @match.update!(
          score: @score,
          winner_id: @winner_id,
          status: :completed
        )

        update_team_progression!
        advance_winner_if_knockout
      end

      Tournaments::NotificationDispatcher.dispatch(
        event: :match_scored,
        tournament: @match.tournament,
        payload: {
          match_id: @match.id,
          round_number: @match.round_number,
          match_number: @match.match_number,
          winner_id: @winner_id
        }
      )

      log_match_played_activity

      ServiceResult.success(@match)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages, error_codes: ["score_update_invalid"])
    end

    private

    def advance_winner_if_knockout
      tournament = @match.tournament
      if tournament.knockout?
        advance_in_knockout_tree
      elsif tournament.group_knockout?
        if @match.round_number == 1
          promote_group_qualifiers_to_knockout
        else
          advance_in_knockout_tree
        end
      end
    end

    def update_team_progression!
      loser_id = ([@match.team1_id, @match.team2_id] - [@winner_id]).compact.first
      return if loser_id.blank?
      return unless @match.tournament.knockout? || (@match.tournament.group_knockout? && @match.round_number > 1)

      TournamentTeam.find_by(id: loser_id)&.update!(status: :eliminated)
      TournamentTeam.find_by(id: @winner_id)&.update!(status: :active)
    end

    def advance_in_knockout_tree
      tournament = @match.tournament

      next_round = @match.round_number + 1
      next_match_number = ((@match.match_number - 1) / 2) + 1
      slot = @match.match_number.odd? ? :team1_id : :team2_id

      next_match = tournament.tournament_matches.find_by(round_number: next_round, match_number: next_match_number)
      return unless next_match

      next_match.update!(slot => @winner_id)
      if next_match.team1_id.present? && next_match.team2_id.present? && next_match.pending?
        next_match.update!(status: :pending)
      end
    end

    def promote_group_qualifiers_to_knockout
      data = @match.tournament.bracket_data.deep_symbolize_keys
      group_round = Array(data[:rounds]).find { |round| round[:stage] == "group" }
      knockout_round = Array(data[:rounds]).find { |round| round[:stage] == "knockout" }
      return if group_round.blank? || knockout_round.blank?

      groups = Array(group_round[:groups])
      standings_by_group = build_group_standings(groups)
      persist_group_standings!(data, standings_by_group)
      qualifiers = determine_group_qualifiers(groups, standings_by_group)

      required_seeds = Array(knockout_round[:matches])
                       .select { |m| m[:round_number].to_i == 2 }
                       .flat_map { |m| [m[:seed1].to_s, m[:seed2].to_s] }
                       .uniq
      return if qualifiers.keys.sort != required_seeds.sort

      Array(knockout_round[:matches]).each do |seed_match|
        next unless seed_match[:round_number].to_i == 2

        match = @match.tournament.tournament_matches.find_by(
          round_number: seed_match[:round_number],
          match_number: seed_match[:match_number]
        )
        next unless match

        team1 = qualifiers[seed_match[:seed1].to_s]
        team2 = qualifiers[seed_match[:seed2].to_s]

        attrs = {}
        attrs[:team1_id] = team1 if team1.present?
        attrs[:team2_id] = team2 if team2.present?
        attrs[:status] = :pending if attrs[:team1_id].present? && attrs[:team2_id].present?

        match.update!(attrs) if attrs.any?
      end
    end

    def build_group_standings(groups)
      groups.each_with_object({}) do |group, result|
        team_ids = Array(group[:team_ids]).map(&:to_i)
        next if team_ids.empty?

        standings = Hash.new { |hash, key| hash[key] = { points: 0, wins: 0, played: 0, losses: 0 } }
        team_ids.each { |id| standings[id] }

        group_matches = @match.tournament.tournament_matches
                               .where(round_number: 1)
                               .where(team1_id: team_ids, team2_id: team_ids)

        completed = group_matches.where(status: :completed)
        required_group_matches = (team_ids.size * (team_ids.size - 1)) / 2

        completed.each do |group_match|
          winner = group_match.winner_id
          loser = ([group_match.team1_id, group_match.team2_id] - [winner]).first
          next if winner.blank? || loser.blank?

          standings[winner][:points] += (@match.tournament.points_win || 3)
          standings[winner][:wins] += 1
          standings[winner][:played] += 1

          standings[loser][:points] += (@match.tournament.points_loss || 0)
          standings[loser][:losses] += 1
          standings[loser][:played] += 1
        end

        ranked = standings
                 .map { |team_id, row| row.merge(team_id: team_id) }
                 .sort_by { |row| [-row[:points], -row[:wins], row[:team_id]] }
                 .each_with_index
                 .map { |row, idx| row.merge(rank: idx + 1) }

        result[group[:name].to_s] = {
          complete: completed.size >= required_group_matches,
          rankings: ranked
        }
      end
    end

    def persist_group_standings!(data, standings_by_group)
      rounds = Array(data[:rounds])
      group_round_idx = rounds.index { |round| round[:stage] == "group" }
      return if group_round_idx.nil?

      groups = Array(rounds[group_round_idx][:groups])
      groups.each do |group|
        standing = standings_by_group[group[:name].to_s]
        next if standing.blank?

        group[:standings] = standing[:rankings]
        qualifiers_count = [group[:qualifiers].to_i, 1].max
        group[:qualified_team_ids] = if standing[:complete]
                                       standing[:rankings].first(qualifiers_count).map { |row| row[:team_id] }
                                     else
                                       []
                                     end
      end

      rounds[group_round_idx][:groups] = groups
      data[:rounds] = rounds
      @match.tournament.update!(bracket_data: data)
    end

    def determine_group_qualifiers(groups, standings_by_group)
      groups.each_with_object({}) do |group, result|
        standing = standings_by_group[group[:name].to_s]
        next if standing.blank? || !standing[:complete]

        qualifiers_count = [group[:qualifiers].to_i, 1].max
        group_letter = group[:name].to_s.split.last

        standing[:rankings].first(qualifiers_count).each_with_index do |row, idx|
          result["#{group_letter}#{idx + 1}"] = row[:team_id]
        end
      end
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end

    def log_match_played_activity
      team_ids = [@match.team1_id, @match.team2_id].compact
      return if team_ids.empty?

      TournamentTeam.where(id: team_ids).includes(:player1, :player2).find_each do |team|
        [team.player1, team.player2].compact.each do |player|
          Crm::ActivityLogger.new(
            player: player,
            activity_type: "match_played",
            reference: @match,
            branch_id: @match.tournament.branch_id,
            metadata: {
              tournament_id: @match.tournament_id,
              match_id: @match.id,
              team_id: team.id,
              winner_id: @winner_id,
              score: @score
            }
          ).call
        end
      end
    end

    def scoreable_status?
      @match.pending? || @match.scheduled? || @match.ongoing?
    end
  end
end
