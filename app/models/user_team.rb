class UserTeam < ApplicationRecord
  belongs_to :user

  enum :teammate_skill_level, { beginner: 0, intermediate: 1, advanced: 2 }

  validates :name, :teammate_name, :teammate_phone, presence: true
  validates :teammate_email,
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "is invalid" },
            allow_blank: true
end
