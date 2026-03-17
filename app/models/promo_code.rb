class PromoCode < ApplicationRecord
  belongs_to :branch
  has_many :bookings, dependent: :nullify

  validates :code, presence: true, uniqueness: { case_sensitive: false, scope: :branch_id }
  validates :description, presence: true
  validates :discount_percentage, numericality: { greater_than: 0, less_than_or_equal_to: 100 }, allow_nil: true
  validates :discount_amount, numericality: { greater_than: 0 }, allow_nil: true
  validates :minimum_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :usage_limit, numericality: { greater_than: 0 }, allow_nil: true
  validates :starts_at, presence: true
  validate :discount_type_present
  validate :starts_before_expires
  validate :not_expired

  scope :active, -> { where(active: true) }
  scope :valid_now, -> { active.where("starts_at <= ? AND (expires_at IS NULL OR expires_at > ?)", Time.current, Time.current) }
  scope :by_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :by_code, ->(code) { where("LOWER(code) = ?", code.downcase) }

  def applicable?(total_amount)
    return false unless active?
    return false unless valid_now?
    return false if expired?
    return false if usage_limit_reached?
    return false if below_minimum_amount?(total_amount)
    true
  end

  def calculate_discount(total_amount)
    return 0 unless applicable?(total_amount)

    discount = 0
    if discount_percentage.present?
      discount = total_amount * (discount_percentage / 100.0)
    elsif discount_amount.present?
      discount = discount_amount
    end

    # Don't discount below zero
    [discount, total_amount].min
  end

  def increment_usage!
    increment!(:used_count)
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def usage_limit_reached?
    usage_limit.present? && used_count >= usage_limit
  end

  private

  def discount_type_present
    if discount_percentage.blank? && discount_amount.blank?
      errors.add(:base, "Either discount percentage or discount amount must be present")
    end
    if discount_percentage.present? && discount_amount.present?
      errors.add(:base, "Cannot have both discount percentage and discount amount")
    end
  end

  def starts_before_expires
    return unless starts_at && expires_at
    if starts_at >= expires_at
      errors.add(:base, "Start date must be before expiration date")
    end
  end

  def not_expired
    if expires_at.present? && expires_at < Time.current
      errors.add(:base, "Promo code has expired")
    end
  end

  def below_minimum_amount?(total_amount)
    minimum_amount.present? && total_amount < minimum_amount
  end
end
