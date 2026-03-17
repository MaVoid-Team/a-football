require "rails_helper"

RSpec.describe "Api::Admin::Courts", type: :request do
  let(:branch) { create(:branch) }
  let(:admin) { create(:admin, :super_admin) }
  let(:headers) { auth_headers(admin) }

  describe "GET /api/admin/courts" do
    it "returns courts for authenticated admin" do
      create_list(:court, 3, branch: branch)

      get "/api/admin/courts", headers: headers

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(3)
    end

    it "returns 401 without token" do
      get "/api/admin/courts"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/admin/courts" do
    it "creates a court" do
      post "/api/admin/courts", params: {
        court: { branch_id: branch.id, name: "New Court", price_per_hour: 200.00 }
      }, headers: headers

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]
      expect(data["attributes"]["name"]).to eq("New Court")
    end
  end

  describe "PATCH /api/admin/courts/:id" do
    it "updates a court" do
      court = create(:court, branch: branch)

      patch "/api/admin/courts/#{court.id}", params: {
        court: { name: "Updated Name" }
      }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(court.reload.name).to eq("Updated Name")
    end
  end

  describe "DELETE /api/admin/courts/:id" do
    it "deletes a court" do
      court = create(:court, branch: branch)

      delete "/api/admin/courts/#{court.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(Court.find_by(id: court.id)).to be_nil
    end
  end

  context "branch admin authorization" do
    let(:other_branch) { create(:branch) }
    let(:branch_admin) { create(:admin, :branch_admin, branch: branch) }
    let(:branch_headers) { auth_headers(branch_admin) }

    it "can only see own branch courts" do
      create(:court, branch: branch)
      create(:court, branch: other_branch)

      get "/api/admin/courts", headers: branch_headers

      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(1)
    end

    it "cannot modify other branch courts" do
      other_court = create(:court, branch: other_branch)

      patch "/api/admin/courts/#{other_court.id}", params: {
        court: { name: "Hacked" }
      }, headers: branch_headers

      expect(response).to have_http_status(:forbidden)
    end
  end
end
