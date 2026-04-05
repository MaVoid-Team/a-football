class Package < ApplicationRecord
  include MeiliSearch::Rails

  belongs_to :branch, optional: true
  has_many :package_requests, dependent: :destroy

  validates :title, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :title, :description, :price, :branch_id
    searchable_attributes [:title, :description]
    filterable_attributes [:branch_id]
  end

  scope :for_branch, ->(branch_id) { where(branch_id: [branch_id, nil]) }
  scope :price_in_range, ->(min, max) {
    scope = all
    scope = scope.where("price >= ?", min) if min.present?
    scope = scope.where("price <= ?", max) if max.present?
    scope
  }
end
