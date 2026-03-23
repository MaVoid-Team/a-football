require "rails_helper"

RSpec.describe Tournaments::ScoreUpdater, type: :service do
  describe "#call" do
    let(:branch) { create(:branch) }
    let(:tournament) { create(:tournament, branch: branch, tournament_type: :knockout) }

    let(:p1) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p2) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p3) { create(:tournament_player, tournament: tournament, status: :approved) }

    let(:team1) { create(:tournament_team, tournament: tournament, player1: p1, name: "Team 1", status: :active) }
    let(:team2) { create(:tournament_team, tournament: tournament, player1: p2, name: "Team 2", status: :active) }
    let(:team3) { create(:tournament_team, tournament: tournament, player1: p3, name: "Team 3", status: :active) }

    let!(:semi) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 1, team1: team1, team2: team2, status: :scheduled) }
    let!(:final) { create(:tournament_match, tournament: tournament, round_number: 2, match_number: 1, team1: nil, team2: team3, status: :pending) }

    it "dispatches notification on successful scoring" do
      expect(Tournaments::NotificationDispatcher).to receive(:dispatch).with(
        hash_including(
          event: :match_scored,
          tournament: tournament,
          payload: hash_including(match_id: semi.id, winner_id: team1.id)
        )
      )

      result = described_class.new(match: semi, winner_id: team1.id, score: { set1: "6-4" }).call

      expect(result).to be_success
      semi.reload
      final.reload
      expect(semi.status).to eq("completed")
      expect(final.team1_id).to eq(team1.id)
    end

    it "promotes group winners into first knockout round for group_knockout" do
      tournament.update!(tournament_type: :group_knockout)

      p4 = create(:tournament_player, tournament: tournament, status: :approved)
      t4 = create(:tournament_team, tournament: tournament, player1: p4, name: "Team 4", status: :active)

      [p1, p2, p3, p4].each do |player|
        create(:tournament_registration, tournament: tournament, player: player, status: :approved)
      end

      generator_result = Tournaments::BracketGenerator.new(tournament: tournament).call
      expect(generator_result).to be_success

      group_matches = tournament.tournament_matches.where(round_number: 1).order(:match_number).to_a
      expect(group_matches.size).to eq(2)

      allow(Tournaments::NotificationDispatcher).to receive(:dispatch)

      m1 = group_matches[0]
      m2 = group_matches[1]

      winner_one = m1.team1_id
      winner_two = m2.team2_id

      described_class.new(match: m1, winner_id: winner_one, score: { set1: "6-4" }).call
      described_class.new(match: m2, winner_id: winner_two, score: { set1: "6-3" }).call

      final_match = tournament.tournament_matches.find_by(round_number: 2, match_number: 1)
      expect(final_match).to be_present
      expect([final_match.team1_id, final_match.team2_id].compact.sort).to eq([winner_one, winner_two].sort)

      tournament.reload
      group_round = tournament.bracket_data["rounds"].find { |round| round["stage"] == "group" }
      expect(group_round).to be_present
      expect(group_round["groups"].all? { |group| group["standings"].present? }).to eq(true)
      expect(group_round["groups"].all? { |group| group["qualified_team_ids"].size == 1 }).to eq(true)
    end

    it "advances winners in knockout rounds for group_knockout" do
      tournament.update!(tournament_type: :group_knockout)

      semi = create(:tournament_match, tournament: tournament, round_number: 2, match_number: 1, team1: team1, team2: team2, status: :scheduled)
      final_group_knockout = create(:tournament_match, tournament: tournament, round_number: 3, match_number: 1, team1: nil, team2: team3, status: :pending)

      allow(Tournaments::NotificationDispatcher).to receive(:dispatch)

      result = described_class.new(match: semi, winner_id: team1.id, score: { set1: "6-2" }).call

      expect(result).to be_success
      final_group_knockout.reload
      expect(final_group_knockout.team1_id).to eq(team1.id)
    end
  end
end
