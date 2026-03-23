class UserNotification < ApplicationRecord
  belongs_to :user

  validates :notification_type, :title, :body, presence: true

  scope :recent_first, -> { order(created_at: :desc) }
  scope :unread, -> { where(read_at: nil) }

  def read?
    read_at.present?
  end
end
