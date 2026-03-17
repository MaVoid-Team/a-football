require "rails_helper"

RSpec.describe Court, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:branch) }
    it { is_expected.to have_many(:bookings).dependent(:destroy) }
    it { is_expected.to have_many(:blocked_slots).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:price_per_hour) }
    it { is_expected.to validate_numericality_of(:price_per_hour).is_greater_than(0) }
  end

  describe "scopes" do
    let(:branch) { create(:branch) }

    it ".active returns only active courts" do
      active = create(:court, branch: branch, active: true)
      create(:court, branch: branch, active: false)
      expect(Court.active).to eq([active])
    end

    it ".for_branch filters by branch" do
      court = create(:court, branch: branch)
      create(:court)
      expect(Court.for_branch(branch.id)).to eq([court])
    end
  end
end
