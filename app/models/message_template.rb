class MessageTemplate < ApplicationRecord
  belongs_to :branch, optional: true

  validates :name, presence: true, uniqueness: { scope: :branch_id }
  validates :content, presence: true
  validates :whatsapp_number, presence: true

  before_validation :normalize_whatsapp_number

  scope :active_only, -> { where(active: true) }
  scope :for_branch, ->(branch_id) { where(branch_id: [nil, branch_id]) }

  private

  def normalize_whatsapp_number
    return if whatsapp_number.blank?

    self.whatsapp_number = whatsapp_number.to_s.gsub(/\D/, "")
  end
end
