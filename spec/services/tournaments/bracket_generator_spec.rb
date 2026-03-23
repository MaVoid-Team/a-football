require "rails_helper"

RSpec.describe Tournaments::BracketGenerator, type: :service do
  describe "#call" do
    let(:branch) { create(:branch) }
    let(:admin) { create(:admin, branch: branch) }
    let(:tournament) { create(:tournament, branch: branch, created_by: admin, tournament_type: :knockout, status: :open) }

    it "auto-advances bye winner to next round" do
      players = Array.new(3) { create(:tournament_player, tournament: tournament, status: :approved) }

      players.each do |player|
        create(:tournament_registration, tournament: tournament, player: player, status: :approved)
      end

      result = described_class.new(tournament: tournament).call

      expect(result).to be_success
      tournament.reload

      first_round = tournament.tournament_matches.where(round_number: 1)
      expect(first_round.count).to eq(2)
      expect(first_round.completed.count).to be >= 1

      final = tournament.tournament_matches.find_by(round_number: 2, match_number: 1)
      expect(final).to be_present
      expect(final.team1_id.present? || final.team2_id.present?).to eq(true)
    end

    it "generates group + knockout structure for group_knockout tournaments" do
      tournament.update!(tournament_type: :group_knockout)
      players = Array.new(8) { create(:tournament_player, tournament: tournament, status: :approved) }

      players.each do |player|
        create(:tournament_registration, tournament: tournament, player: player, status: :approved)
      end

      result = described_class.new(tournament: tournament).call

      expect(result).to be_success
      tournament.reload

      rounds = tournament.bracket_data["rounds"]
      expect(rounds).to be_present
      expect(rounds.first["stage"]).to eq("group")
      expect(rounds.first["groups"].size).to eq(2)
      expect(rounds.first["matches"].size).to eq(12)
      expect(rounds.first["groups"].first["tiebreak_order"]).to eq(["points", "wins", "team_id"])
      expect(rounds.first["groups"].first["standings"]).to eq([])
      expect(rounds.first["groups"].first["qualified_team_ids"]).to eq([])

      knockout_round = rounds.find { |round| round["stage"] == "knockout" }
      expect(knockout_round).to be_present
      expect(knockout_round["matches"].size).to eq(1)

      persisted_group_matches = tournament.tournament_matches.where(round_number: 1)
      persisted_knockout_matches = tournament.tournament_matches.where(round_number: 2)

      expect(persisted_group_matches.count).to eq(12)
      expect(persisted_knockout_matches.count).to eq(1)
    end
  end
end
