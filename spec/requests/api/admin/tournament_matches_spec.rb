require "rails_helper"

RSpec.describe "Api::Admin::TournamentMatches", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:super_admin) { create(:admin, :super_admin) }
  let(:headers) { auth_headers(admin) }
  let(:super_admin_headers) { auth_headers(super_admin) }

  let(:tournament) { create(:tournament, branch: branch, created_by: admin, tournament_type: :knockout) }
  let(:p1) { create(:tournament_player, tournament: tournament, status: :approved) }
  let(:p2) { create(:tournament_player, tournament: tournament, status: :approved) }
  let(:p3) { create(:tournament_player, tournament: tournament, status: :approved) }
  let(:p4) { create(:tournament_player, tournament: tournament, status: :approved) }

  let(:team1) { create(:tournament_team, tournament: tournament, player1: p1, name: "Team 1", status: :active) }
  let(:team2) { create(:tournament_team, tournament: tournament, player1: p2, name: "Team 2", status: :active) }
  let(:team3) { create(:tournament_team, tournament: tournament, player1: p3, name: "Team 3", status: :active) }
  let(:team4) { create(:tournament_team, tournament: tournament, player1: p4, name: "Team 4", status: :active) }

  let!(:semi1) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 1, team1: team1, team2: team2) }
  let!(:semi2) { create(:tournament_match, tournament: tournament, round_number: 1, match_number: 2, team1: team3, team2: team4) }
  let!(:final) { create(:tournament_match, tournament: tournament, round_number: 2, match_number: 1, team1: nil, team2: nil) }

  describe "PATCH /api/admin/matches/:id/schedule" do
    let(:court) { create(:court, branch: branch) }

    it "schedules a match" do
      patch "/api/admin/matches/#{semi1.id}/schedule",
            params: { match: { court_id: court.id, scheduled_time: 2.days.from_now } },
            headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      expect(semi1.status).to eq("scheduled")
      expect(semi1.court_id).to eq(court.id)
      expect(semi1.scheduled_time).to be_present
    end

    it "prevents scheduling when match is locked" do
      semi1.update!(schedule_locked: true, schedule_lock_reason: "Manual lock")

      patch "/api/admin/matches/#{semi1.id}/schedule",
            params: { match: { court_id: court.id, scheduled_time: 2.days.from_now } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("locked_match")
    end

    it "allows override scheduling for locked match" do
      semi1.update!(schedule_locked: true, schedule_lock_reason: "Manual lock")

      patch "/api/admin/matches/#{semi1.id}/schedule",
            params: { match: { court_id: court.id, scheduled_time: 2.days.from_now, override: true } },
            headers: super_admin_headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      expect(semi1.court_id).to eq(court.id)
      expect(semi1.status).to eq("scheduled")
    end

    it "rejects override scheduling for branch admin" do
      semi1.update!(schedule_locked: true, schedule_lock_reason: "Manual lock")

      patch "/api/admin/matches/#{semi1.id}/schedule",
            params: { match: { court_id: court.id, scheduled_time: 2.days.from_now, override: true } },
            headers: headers

      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("override_not_allowed")
    end

    it "allows immediate back-to-back scheduling for same team when times do not overlap" do
      time = 3.days.from_now.change(min: 0)
      semi1.update!(court: court, scheduled_time: time, status: :scheduled)

      another_match = create(
        :tournament_match,
        tournament: tournament,
        round_number: 1,
        match_number: 3,
        team1: team1,
        team2: team3
      )

      patch "/api/admin/matches/#{another_match.id}/schedule",
            params: { match: { court_id: court.id, scheduled_time: time + tournament.match_duration_minutes.minutes } },
            headers: headers

      expect(response).to have_http_status(:ok)
    end

    it "prevents scheduling overlapping matches for the same team" do
      other_court = create(:court, branch: branch)
      time = 3.days.from_now.change(min: 0)
      semi1.update!(court: court, scheduled_time: time, status: :scheduled)

      another_match = create(
        :tournament_match,
        tournament: tournament,
        round_number: 1,
        match_number: 3,
        team1: team1,
        team2: team3
      )

      patch "/api/admin/matches/#{another_match.id}/schedule",
            params: { match: { court_id: other_court.id, scheduled_time: time } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("team_back_to_back")
    end
  end

  describe "PATCH /api/admin/matches/:id/lock" do
    it "locks and unlocks scheduling" do
      patch "/api/admin/matches/#{semi1.id}/lock",
            params: { match: { locked: true, reason: "Referee assignment fixed" } },
            headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      expect(semi1.schedule_locked).to eq(true)

      patch "/api/admin/matches/#{semi1.id}/lock",
            params: { match: { locked: false } },
            headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      expect(semi1.schedule_locked).to eq(false)
    end
  end

  describe "PATCH /api/admin/matches/:id/score" do
    it "completes match and advances winner in knockout" do
      patch "/api/admin/matches/#{semi1.id}/score",
            params: { match: { winner_id: team1.id, score: { set1: "6-3", set2: "6-4" } } },
            headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      final.reload
      expect(semi1.status).to eq("completed")
      expect(semi1.winner_id).to eq(team1.id)
      expect(final.team1_id).to eq(team1.id)
    end

    it "rejects invalid winner" do
      outsider = create(:tournament_team, tournament: tournament, player1: create(:tournament_player, tournament: tournament, status: :approved), name: "Outsider", status: :active)

      patch "/api/admin/matches/#{semi1.id}/score",
            params: { match: { winner_id: outsider.id, score: { set1: "6-0" } } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error_codes"]).to include("invalid_winner")
    end
  end

  describe "POST /api/admin/tournaments/:id/auto_schedule" do
    let!(:court_one) { create(:court, branch: branch) }
    let!(:court_two) { create(:court, branch: branch) }

    it "auto schedules playable matches in the same time slot across courts" do
      post "/api/admin/tournaments/#{tournament.id}/auto_schedule",
           params: {
             schedule: {
               start_time: 2.days.from_now,
               court_ids: [court_one.id, court_two.id]
             }
           },
           headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      semi2.reload
      expect(semi1.scheduled_time).to be_present
      expect(semi2.scheduled_time).to be_present
      expect([court_one.id, court_two.id]).to include(semi1.court_id)
      expect([court_one.id, court_two.id]).to include(semi2.court_id)
      expect(semi1.scheduled_time.to_i).to eq(semi2.scheduled_time.to_i)
    end

    it "skips locked matches unless override_locked is enabled" do
      semi1.update!(schedule_locked: true, schedule_lock_reason: "Pinned")

      post "/api/admin/tournaments/#{tournament.id}/auto_schedule",
           params: {
             schedule: {
               start_time: 2.days.from_now,
               court_ids: [court_one.id, court_two.id]
             }
           },
           headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      semi2.reload
      expect(semi1.scheduled_time).to be_nil
      expect(semi2.scheduled_time).to be_present

      post "/api/admin/tournaments/#{tournament.id}/auto_schedule",
           params: {
             schedule: {
               start_time: 2.days.from_now + 2.hours,
               court_ids: [court_one.id, court_two.id],
               override_locked: true
             }
           },
           headers: headers

      expect(response).to have_http_status(:ok)
      semi1.reload
      expect(semi1.scheduled_time).to be_present
    end
  end
end
