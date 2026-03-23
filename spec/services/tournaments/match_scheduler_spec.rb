require "rails_helper"

RSpec.describe Tournaments::MatchScheduler, type: :service do
  describe "#call" do
    let(:branch) { create(:branch) }
    let(:other_branch) { create(:branch) }
    let(:tournament) { create(:tournament, branch: branch, match_duration_minutes: 60) }

    let(:p1) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p2) { create(:tournament_player, tournament: tournament, status: :approved) }
    let(:p3) { create(:tournament_player, tournament: tournament, status: :approved) }

    let(:team1) { create(:tournament_team, tournament: tournament, player1: p1, name: "Team 1", status: :active) }
    let(:team2) { create(:tournament_team, tournament: tournament, player1: p2, name: "Team 2", status: :active) }
    let(:team3) { create(:tournament_team, tournament: tournament, player1: p3, name: "Team 3", status: :active) }

    let(:match) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 1, team1: team1, team2: team2) }
    let(:court) { create(:court, branch: branch) }

    it "succeeds for valid scheduling" do
      result = described_class.new(
        match: match,
        court_id: court.id,
        scheduled_time: 2.days.from_now
      ).call

      expect(result).to be_success
      match.reload
      expect(match.status).to eq("scheduled")
      expect(match.court_id).to eq(court.id)
      expect(match.scheduled_time).to be_present
    end

    it "fails for court outside branch" do
      foreign_court = create(:court, branch: other_branch)

      result = described_class.new(
        match: match,
        court_id: foreign_court.id,
        scheduled_time: 2.days.from_now
      ).call

      expect(result).to be_failure
      expect(result.error_codes).to include("invalid_court")
    end

    it "fails when match is locked without override" do
      match.update!(schedule_locked: true, schedule_lock_reason: "Pinned")

      result = described_class.new(
        match: match,
        court_id: court.id,
        scheduled_time: 2.days.from_now
      ).call

      expect(result).to be_failure
      expect(result.error_codes).to include("locked_match")
    end

    it "fails on blocked slot" do
      scheduled_time = 2.days.from_now.change(min: 0)
      create(
        :blocked_slot,
        branch: branch,
        court: court,
        date: scheduled_time.to_date,
        start_time: (scheduled_time - 5.minutes).strftime("%H:%M"),
        end_time: (scheduled_time + 30.minutes).strftime("%H:%M"),
        reason: "Maintenance"
      )

      result = described_class.new(
        match: match,
        court_id: court.id,
        scheduled_time: scheduled_time
      ).call

      expect(result).to be_failure
      expect(result.error_codes).to include("blocked_slot")
    end

    it "allows immediate back-to-back matches for the same team" do
      scheduled_time = 2.days.from_now.change(min: 0)
      create(
        :tournament_match,
        tournament: tournament,
        round_number: 1,
        match_number: 2,
        team1: team1,
        team2: team3,
        court: court,
        scheduled_time: scheduled_time,
        status: :scheduled
      )

      result = described_class.new(
        match: match,
        court_id: court.id,
        scheduled_time: scheduled_time + 60.minutes
      ).call

      expect(result).to be_success
    end

    it "fails when same team is scheduled at overlapping time" do
      other_court = create(:court, branch: branch)
      scheduled_time = 2.days.from_now.change(min: 0)
      create(
        :tournament_match,
        tournament: tournament,
        round_number: 1,
        match_number: 2,
        team1: team1,
        team2: team3,
        court: other_court,
        scheduled_time: scheduled_time,
        status: :scheduled
      )

      result = described_class.new(
        match: match,
        court_id: court.id,
        scheduled_time: scheduled_time
      ).call

      expect(result).to be_failure
      expect(result.error_codes).to include("team_back_to_back")
    end
  end
end
