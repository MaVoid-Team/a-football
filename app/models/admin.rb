class Admin < ApplicationRecord
  include MeiliSearch::Rails

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :email, :branch_id, :role
    searchable_attributes [:email]
    filterable_attributes [:branch_id, :role]
  end

  has_secure_password

  belongs_to :branch, optional: true

  enum :role, { super_admin: 0, branch_admin: 1 }

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :branch, presence: true, if: :branch_admin?
end
