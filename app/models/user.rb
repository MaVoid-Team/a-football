class User < ApplicationRecord
  include MeiliSearch::Rails

  has_secure_password

  has_many :tournament_players, dependent: :nullify
  has_many :bookings, dependent: :nullify
  has_many :user_notifications, dependent: :destroy
  has_many :user_teams, dependent: :destroy

  enum :skill_level, { beginner: 0, intermediate: 1, advanced: 2 }

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :name, :phone, :email, :skill_level
    searchable_attributes [:name, :phone, :email]
    filterable_attributes [:skill_level]
  end

  validates :name, presence: true
  validates :phone, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password.present? }

  scope :active_recently, -> { where("last_activity_date >= ?", 7.days.ago) }
  scope :inactive_since, -> { where("last_activity_date <= ? OR last_activity_date IS NULL", 30.days.ago) }

  def add_tag!(tag)
    normalized = tag.to_s.strip.downcase
    return if normalized.blank?

    update!(tags: (tags + [normalized]).uniq)
  end

  def remove_tag!(tag)
    normalized = tag.to_s.strip.downcase
    return if normalized.blank?

    update!(tags: tags - [normalized])
  end
end
