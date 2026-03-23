require "rails_helper"

RSpec.describe "Api::Admin::Settings", type: :request do
  let(:branch) { create(:branch) }
  let(:other_branch) { create(:branch) }
  let(:admin) { create(:admin, branch: branch) }
  let(:super_admin) { create(:admin, :super_admin) }

  describe "PATCH /api/admin/settings" do
    it "persists tournament notification fields for the admin branch" do
      setting = create(:setting, branch: branch)

      patch "/api/admin/settings",
            params: {
              setting: {
                tournament_registration_admin_email: "alerts@example.com",
                send_registration_alerts_to_global_recipient: true
              }
            },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      setting.reload
      expect(setting.tournament_registration_admin_email).to eq("alerts@example.com")
      expect(setting.send_registration_alerts_to_global_recipient).to be(true)
    end

    it "lets super admins update settings for a selected branch" do
      setting = create(:setting, branch: other_branch)

      patch "/api/admin/settings",
            params: {
              setting: {
                branch_id: other_branch.id,
                tournament_registration_admin_email: "branch-alerts@example.com",
                send_registration_alerts_to_global_recipient: false
              }
            },
            headers: auth_headers(super_admin)

      expect(response).to have_http_status(:ok)
      setting.reload
      expect(setting.tournament_registration_admin_email).to eq("branch-alerts@example.com")
      expect(setting.send_registration_alerts_to_global_recipient).to be(false)
    end

    it "prevents branch admins from updating another branch" do
      create(:setting, branch: branch)
      other_setting = create(:setting, branch: other_branch)

      patch "/api/admin/settings",
            params: {
              setting: {
                branch_id: other_branch.id,
                tournament_registration_admin_email: "blocked@example.com"
              }
            },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      other_setting.reload
      expect(other_setting.tournament_registration_admin_email).not_to eq("blocked@example.com")
    end
  end
end
