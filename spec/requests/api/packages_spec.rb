require "rails_helper"

RSpec.describe "Api::Packages", type: :request do
  describe "GET /api/packages" do
    let(:branch) { create(:branch) }

    it "returns global packages when no branch_id" do
      create(:package, branch: nil, title: "Global")
      create(:package, branch: branch, title: "Branch Specific")

      get "/api/packages"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(1)
      expect(data.first["attributes"]["title"]).to eq("Global")
    end

    it "returns branch and global packages with branch_id" do
      create(:package, branch: nil, title: "Global")
      create(:package, branch: branch, title: "Branch Specific")

      get "/api/packages", params: { branch_id: branch.id }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]
      expect(data.length).to eq(2)
    end
  end
end
