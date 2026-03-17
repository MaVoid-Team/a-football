require "rails_helper"

RSpec.describe Admin, type: :model do
  describe "associations" do
    subject { build(:admin, :super_admin) }
    it { is_expected.to belong_to(:branch).optional }
  end

  describe "validations" do
    subject { build(:admin) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to have_secure_password }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:role).with_values(super_admin: 0, branch_admin: 1) }
  end

  describe "branch validation for branch_admin" do
    it "requires branch for branch_admin" do
      admin = build(:admin, role: :branch_admin, branch: nil)
      expect(admin).not_to be_valid
    end

    it "allows nil branch for super_admin" do
      admin = build(:admin, :super_admin)
      expect(admin).to be_valid
    end
  end
end
