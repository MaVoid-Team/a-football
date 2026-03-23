class TournamentPlayer < ApplicationRecord
  belongs_to :tournament
  belongs_to :user, optional: true

  has_many :registration_records,
           class_name: "TournamentRegistration",
           foreign_key: :player_id,
           dependent: :destroy

  enum :skill_level, { beginner: 0, intermediate: 1, advanced: 2 }
  enum :status, { pending: 0, approved: 1, rejected: 2, cancelled: 3 }

  validates :name, :phone, presence: true
  validates :phone, uniqueness: { scope: :tournament_id }
  validates :user_id, uniqueness: { scope: :tournament_id }, allow_nil: true
  validates :email,
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "is invalid" },
            allow_blank: true

  scope :for_user, ->(user_id) { where(user_id: user_id) }

  def self.for_account(user)
    return none if user.blank?

    scopes = [where(user_id: user.id)]
    scopes << where(phone: user.phone) if user.phone.present?
    scopes << where(email: user.email) if user.email.present?

    scopes.reduce { |relation, scope| relation.or(scope) }.distinct
  end

  def self.for_account_in_tournament(user, tournament_id)
    for_account(user).where(tournament_id: tournament_id)
  end

  def self.claim_for_account!(user)
    return if user.blank?

    for_account(user).where(user_id: nil).find_each do |player|
      next if exists?(tournament_id: player.tournament_id, user_id: user.id)

      player.update_columns(user_id: user.id, updated_at: Time.current)
    end
  end
end
