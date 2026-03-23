require "rails_helper"

RSpec.describe Tournaments::AutoScheduler, type: :service do
  describe "#call" do
    let(:branch) { create(:branch) }
    let(:tournament) { create(:tournament, branch: branch, match_duration_minutes: 60) }

    let(:p1) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p2) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p3) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p4) { create(:tournament_player, tournament: tournament, status: :approved) }

    let(:team1) { create(:tournament_team, tournament: tournament, player1: p1, name: "Team 1", status: :active) }
    let(:team2) { create(:tournament_team, tournament: tournament, player1: p2, name: "Team 2", status: :active) }
    let(:team3) { create(:tournament_team, tournament: tournament, player1: p3, name: "Team 3", status: :active) }
    let(:team4) { create(:tournament_team, tournament: tournament, player1: p4, name: "Team 4", status: :active) }

    let!(:match1) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 1, team1: team1, team2: team2) }
    let!(:match2) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 2, team1: team3, team2: team4) }

    let(:court_one) { create(:court, branch: branch) }
    let(:court_two) { create(:court, branch: branch) }

    it "schedules playable matches in parallel time slots when courts are available" do
      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now,
        court_ids: [court_one.id, court_two.id]
      ).call

      expect(result).to be_success
      match1.reload
      match2.reload
      expect(match1.scheduled_time).to be_present
      expect(match2.scheduled_time).to be_present
      expect(match1.scheduled_time.to_i).to eq(match2.scheduled_time.to_i)
    end

    it "skips locked matches when override_locked is false" do
      match1.update!(schedule_locked: true, schedule_lock_reason: "Pinned")

      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now,
        court_ids: [court_one.id, court_two.id]
      ).call

      expect(result).to be_success
      match1.reload
      match2.reload
      expect(match1.scheduled_time).to be_nil
      expect(match2.scheduled_time).to be_present
    end

    it "includes locked matches when override_locked is true" do
      match1.update!(schedule_locked: true, schedule_lock_reason: "Pinned")

      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now,
        court_ids: [court_one.id, court_two.id],
        override_locked: true
      ).call

      expect(result).to be_success
      match1.reload
      expect(match1.scheduled_time).to be_present
    end

    it "does not reschedule already scheduled matches" do
      original_time = 1.day.from_now.change(min: 0)
      match1.update!(court: court_one, scheduled_time: original_time, status: :scheduled)

      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now,
        court_ids: [court_one.id, court_two.id]
      ).call

      expect(result).to be_success
      match1.reload
      match2.reload
      expect(match1.scheduled_time.to_i).to eq(original_time.to_i)
      expect(match2.scheduled_time).to be_present
    end

    it "can schedule ready matches from different rounds in the same slot" do
      match2.update!(team1: nil, team2: nil)
      cross_round_match = create(
        :tournament_match,
        tournament: tournament,
        round_number: 2,
        match_number: 1,
        team1: team3,
        team2: team4
      )

      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now.change(min: 0),
        court_ids: [court_one.id, court_two.id]
      ).call

      expect(result).to be_success
      match1.reload
      cross_round_match.reload
      expect(match1.scheduled_time).to be_present
      expect(cross_round_match.scheduled_time).to be_present
      expect(match1.scheduled_time.to_i).to eq(cross_round_match.scheduled_time.to_i)
    end

    it "fails when no courts are provided" do
      result = described_class.new(
        tournament: tournament,
        start_time: 2.days.from_now,
        court_ids: []
      ).call

      expect(result).to be_failure
      expect(result.error_codes).to include("missing_courts")
    end
  end
end
