class TournamentPlayer < ApplicationRecord
  belongs_to :tournament

  has_many :registration_records,
           class_name: "TournamentRegistration",
           foreign_key: :player_id,
           dependent: :destroy

  enum :skill_level, { beginner: 0, intermediate: 1, advanced: 2 }
  enum :status, { pending: 0, approved: 1, rejected: 2, cancelled: 3 }

  validates :name, :phone, presence: true
  validates :phone, uniqueness: { scope: :tournament_id }

  scope :for_user, ->(user_id) { where(user_id: user_id) }
end
