class PackageRequest < ApplicationRecord
  belongs_to :package
  belongs_to :branch, optional: true

  validates :customer_name, presence: true
  validates :customer_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :customer_phone, presence: true
  validates :special_needs, presence: true

  enum :status,
       {
         pending: "pending",
         reviewed: "reviewed",
         contacted: "contacted",
         completed: "completed",
         archived: "archived"
       },
       default: :pending

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :by_status, ->(status) { where(status: status) }
  scope :recent_first, -> { order(created_at: :desc) }
end
