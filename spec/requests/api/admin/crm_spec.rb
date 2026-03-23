require "rails_helper"

RSpec.describe "Api::Admin::CRM", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:headers) { auth_headers(admin) }

  let!(:user_player) do
    create(
      :user,
      name: "Ali",
      phone: "+201000000001",
      total_bookings: 4,
      total_matches: 2,
      total_tournaments: 1,
      last_activity_date: 2.days.ago,
      tags: ["vip"]
    )
  end

  let!(:guest_player) do
    create(
      :tournament_player,
      tournament: create(:tournament, branch: branch),
      user: nil,
      name: "Guest One",
      phone: "+201000000002",
      total_bookings: 1,
      total_matches: 0,
      total_tournaments: 1,
      last_activity_date: 40.days.ago,
      tags: ["inactive"]
    )
  end

  let!(:warm_player) do
    create(
      :user,
      name: "Warm User",
      phone: "+201000000003",
      total_bookings: 2,
      total_matches: 1,
      total_tournaments: 0,
      last_activity_date: 15.days.ago,
      tags: []
    )
  end

  let!(:segment) do
    create(
      :segment,
      name: "frequent",
      conditions: {
        "operator" => "all",
        "rules" => [
          { "field" => "total_bookings", "op" => "gte", "value" => 3 }
        ]
      }
    )
  end

  let!(:template) do
    create(
      :message_template,
      name: "reengagement",
      content: "Hi {name}, we miss you at {club_name}",
      whatsapp_number: "+201001234567"
    )
  end

  before do
    create(
      :activity_log,
      branch: branch,
      actor_admin: admin,
      player: user_player,
      activity_type: "booking",
      metadata: { booking_id: 111 }
    )

    create(
      :activity_log,
      branch: branch,
      actor_admin: admin,
      player: guest_player,
      activity_type: "tournament_join",
      metadata: { tournament_id: 222 }
    )
  end

  describe "GET /api/admin/crm/dashboard" do
    it "returns CRM dashboard payload" do
      get "/api/admin/crm/dashboard", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body["total_players"]).to be >= 2
      expect(body["active_players"]).to be >= 1
      expect(body["inactive_players"]).to be >= 1
      expect(body["top_players"]).to be_an(Array)
      expect(body["recent_activity"]).to be_an(Array)
    end
  end

  describe "GET /api/admin/crm/players" do
    it "returns players with pagination headers" do
      get "/api/admin/crm/players", params: { page: 1, per_page: 10 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.headers["X-Total-Count"]).to be_present
      expect(response.headers["X-Page"]).to eq("1")

      body = JSON.parse(response.body)
      expect(body["data"]).to be_an(Array)
      keys = body["data"].map { |row| row["key"] }
      expect(keys).to include("User-#{user_player.id}")
      expect(keys).to include("TournamentPlayer-#{guest_player.id}")
    end

    it "filters by search" do
      get "/api/admin/crm/players", params: { search: "Ali" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }
      expect(names).to include("Ali")
      expect(names).not_to include("Guest One")
    end

    it "filters by active status" do
      get "/api/admin/crm/players", params: { status: "active" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }
      expect(names).to include("Ali")
      expect(names).not_to include("Guest One")
    end

    it "filters by warm status" do
      get "/api/admin/crm/players", params: { status: "warm" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }
      expect(names).to include("Warm User")
      expect(names).not_to include("Ali")
      expect(names).not_to include("Guest One")
    end
  end

  describe "GET /api/admin/crm/players/:id" do
    it "returns player profile with activities" do
      get "/api/admin/crm/players/User-#{user_player.id}", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body.dig("data", "name")).to eq("Ali")
      expect(body.dig("data", "activities")).to be_an(Array)
      expect(body.dig("data", "tags")).to include("vip")
    end

    it "filters activities by activity_type and includes actor admin name" do
      create(
        :activity_log,
        branch: branch,
        actor_admin: admin,
        player: user_player,
        activity_type: "match_played",
        metadata: { match_id: 9 }
      )

      get "/api/admin/crm/players/User-#{user_player.id}", params: { activity_type: "booking" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      activities = body.dig("data", "activities")
      expect(activities).not_to be_empty
      expect(activities.all? { |activity| activity["activity_type"] == "booking" }).to be(true)
      expect(activities.first["actor_admin_name"]).to eq(admin.name)
    end

    it "returns paginated activity metadata" do
      5.times do |i|
        create(
          :activity_log,
          branch: branch,
          actor_admin: admin,
          player: user_player,
          activity_type: "booking",
          metadata: { booking_id: 100 + i }
        )
      end

      get "/api/admin/crm/players/User-#{user_player.id}", params: { activity_page: 1, activity_per_page: 3 }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      activities = body.dig("data", "activities")
      meta = body.dig("data", "activities_meta")

      expect(activities.length).to eq(3)
      expect(meta["page"]).to eq(1)
      expect(meta["per_page"]).to eq(3)
      expect(meta["total_count"]).to be >= 6
      expect(meta["has_more"]).to eq(true)
    end
  end

  describe "PATCH /api/admin/crm/players/:id/tags" do
    it "adds and removes tags" do
      patch "/api/admin/crm/players/User-#{user_player.id}/tags", params: { action_type: "add", tag: "high_value" }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(user_player.reload.tags).to include("high_value")

      patch "/api/admin/crm/players/User-#{user_player.id}/tags", params: { action_type: "remove", tag: "high_value" }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(user_player.reload.tags).not_to include("high_value")
    end
  end

  describe "GET /api/admin/crm/segments" do
    it "returns segment list" do
      get "/api/admin/crm/segments", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }
      expect(names).to include("frequent")
    end
  end

  describe "GET /api/admin/crm/segments/:id/players" do
    it "returns players matching the segment" do
      get "/api/admin/crm/segments/#{segment.id}/players", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }

      expect(names).to include("Ali")
      expect(names).not_to include("Guest One")
    end
  end

  describe "POST /api/admin/crm/segments" do
    it "creates a dynamic segment" do
      post "/api/admin/crm/segments",
           params: {
             segment: {
               name: "no_show_risk",
               auto_update: true,
               active: true,
               conditions: {
                 "operator" => "all",
                 "rules" => [
                   { "field" => "no_show_count", "op" => "gte", "value" => 1 }
                 ]
               }
             }
           },
           headers: headers

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body.dig("data", "name")).to eq("no_show_risk")
      expect(body.dig("data", "auto_update")).to eq(true)
    end
  end

  describe "GET and POST /api/admin/crm/automation_rules" do
    it "creates and lists automation rules" do
      post "/api/admin/crm/automation_rules",
           params: {
             automation_rule: {
               name: "Inactive follow-up",
               trigger_type: "inactivity",
               action_type: "suggest_whatsapp",
               template_id: template.id,
               is_active: true,
               conditions: {
                 "last_activity_days" => ">7"
               }
             }
           },
           headers: headers

      expect(response).to have_http_status(:created)

      get "/api/admin/crm/automation_rules", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].map { |row| row["name"] }).to include("Inactive follow-up")
    end
  end

  describe "Action Center APIs" do
    let!(:automation_rule) do
      create(
        :automation_rule,
        name: "No-show action",
        trigger_type: "no_show_detected",
        action_type: "suggest_whatsapp",
        branch: branch,
        template: template,
        created_by_admin: admin,
        conditions: {
          "operator" => "all",
          "rules" => [
            { "field" => "no_show_count", "op" => "gte", "value" => 1 }
          ]
        }
      )
    end

    let!(:action_item) do
      create(
        :action_item,
        player_type: "User",
        player_id: user_player.id,
        automation_rule: automation_rule,
        suggested_template: template,
        branch: branch,
        reason: "Player inactive for 10 days",
        status: "pending"
      )
    end

    it "lists pending actions" do
      get "/api/admin/crm/action_items", params: { status: "pending" }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].map { |row| row["id"] }).to include(action_item.id)
    end

    it "marks action as completed" do
      patch "/api/admin/crm/action_items/#{action_item.id}", params: { status: "completed" }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(action_item.reload.status).to eq("completed")
    end

    it "generates whatsapp link for action item" do
      post "/api/admin/crm/action_items/#{action_item.id}/whatsapp_link", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "whatsapp_link")).to start_with("https://wa.me/")
    end

    it "generates bulk whatsapp links by segment" do
      create(
        :segment_membership,
        segment: segment,
        player_type: "User",
        player_id: user_player.id,
        branch: branch,
        matched_at: Time.current
      )

      post "/api/admin/crm/action_items/bulk_whatsapp_links",
           params: {
             segment_id: segment.id,
             template_id: template.id
           },
           headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"]).to be_an(Array)
      expect(body["meta"]["segment_id"]).to eq(segment.id)
    end
  end

  describe "GET and PATCH /api/admin/crm/scoring_settings" do
    it "returns scoring settings for the current branch" do
      CrmScoringSetting.create!(
        branch: branch,
        activity_weight: 35,
        frequency_weight: 25,
        engagement_weight: 25,
        reliability_weight: 15
      )

      get "/api/admin/crm/scoring_settings", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "branch_id")).to eq(branch.id)
      expect(body.dig("data", "activity_weight")).to eq(35)
    end

    it "updates scoring settings" do
      patch "/api/admin/crm/scoring_settings",
            params: {
              scoring_setting: {
                activity_weight: 40,
                frequency_weight: 20,
                engagement_weight: 20,
                reliability_weight: 20
              }
            },
            headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig("data", "activity_weight")).to eq(40)
      expect(CrmScoringSetting.find_by(branch_id: branch.id)&.frequency_weight).to eq(20)
    end
  end

  describe "GET and POST /api/admin/crm/message_templates" do
    it "lists templates" do
      get "/api/admin/crm/message_templates", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body["data"].map { |row| row["name"] }
      expect(names).to include("reengagement")
    end

    it "creates template" do
      post "/api/admin/crm/message_templates",
           params: {
             message_template: {
               name: "tournament_invite",
               content: "Hi {name}, tournament opens soon",
               whatsapp_number: "+201009998887",
               active: true
             }
           },
           headers: headers

      expect(response).to have_http_status(:created)
      expect(MessageTemplate.find_by(name: "tournament_invite")).to be_present
    end
  end

  describe "POST /api/admin/crm/whatsapp_links" do
    it "returns WhatsApp redirect link from template" do
      post "/api/admin/crm/whatsapp_links",
           params: {
             template_id: template.id,
             player_key: "User-#{user_player.id}"
           },
           headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      link = body.dig("data", "whatsapp_link")
      message = body.dig("data", "message")

      expect(link).to start_with("https://wa.me/")
      expect(link).to include("text=")
      expect(message).to include("Ali")
    end
  end
end
