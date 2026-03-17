require "rails_helper"

RSpec.describe Branch, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:admins).dependent(:destroy) }
    it { is_expected.to have_many(:courts).dependent(:destroy) }
    it { is_expected.to have_many(:packages).dependent(:destroy) }
    it { is_expected.to have_many(:events).dependent(:destroy) }
    it { is_expected.to have_many(:bookings).dependent(:destroy) }
    it { is_expected.to have_many(:blocked_slots).dependent(:destroy) }
    it { is_expected.to have_one(:setting).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:timezone) }
  end

  describe "scopes" do
    it "returns only active branches" do
      active = create(:branch, active: true)
      create(:branch, active: false)
      expect(Branch.active).to eq([active])
    end
  end
end
