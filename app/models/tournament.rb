class Tournament < ApplicationRecord
  include MeiliSearch::Rails

  belongs_to :branch
  belongs_to :created_by, class_name: "Admin", optional: true

  has_many :tournament_matches, dependent: :destroy
  has_many :tournament_registrations, dependent: :destroy
  has_many :tournament_teams, dependent: :destroy
  has_many :tournament_players, dependent: :destroy

  enum :tournament_type, { knockout: 0, round_robin: 1, group_knockout: 2 }
  enum :status, { draft: 0, open: 1, full: 2, ongoing: 3, completed: 4 }

  meilisearch enqueue: true, raise_on_failure: false do
    attribute :name, :description, :branch_id, :status, :tournament_type, :start_date, :registration_deadline
    searchable_attributes [:name, :description]
    filterable_attributes [:branch_id, :status, :tournament_type]
  end

  validates :name, presence: true
  validates :start_date, :registration_deadline, presence: true
  validates :match_duration_minutes, numericality: { greater_than: 0 }
  validates :max_players, numericality: { greater_than: 0 }, allow_nil: true
  validates :max_teams, numericality: { greater_than: 0 }, allow_nil: true
  validate :registration_before_start

  scope :for_branch, ->(branch_id) { where(branch_id: branch_id) }
  scope :visible_publicly, -> { where(status: %i[open full ongoing completed]) }

  def registration_open?
    return false if registration_deadline.blank?
    open? && Time.current <= registration_deadline && !full_capacity?
  end

  def full_capacity?
    if max_teams.present?
      if tournament_teams.active.exists?
        tournament_teams.active.count >= max_teams
      else
        # Before teams are formed, treat approved players as doubles slots.
        tournament_registrations.approved.count >= (max_teams * 2)
      end
    elsif max_players.present?
      tournament_registrations.approved.count >= max_players
    else
      false
    end
  end

  private

  def registration_before_start
    return if registration_deadline.blank? || start_date.blank?
    return if registration_deadline <= start_date

    errors.add(:registration_deadline, "must be before or equal to start date")
  end
end
