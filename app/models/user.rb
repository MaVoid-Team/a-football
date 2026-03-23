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
end
