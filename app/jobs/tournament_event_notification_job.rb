class TournamentEventNotificationJob < ApplicationJob
  queue_as :notifications

  GLOBAL_REGISTRATION_ALERT_EMAIL = "z.ahmed@mavoid.com".freeze

  def perform(event, tournament_id, payload = {})
    tournament = Tournament.find_by(id: tournament_id)
    return unless tournament

    channels = active_channels

    Rails.logger.info(
      "[TournamentNotification] event=#{event} tournament_id=#{tournament.id} channels=#{channels.join(',')} payload=#{payload.inspect}"
    )

    deliver_email_notifications(event, tournament, payload) if channels.include?("email")
  end

  private

  def deliver_email_notifications(event, tournament, payload)
    recipients_for(event, tournament).each do |recipient|
      TournamentNotificationMailer.with(
        event: event,
        tournament: tournament,
        payload: payload,
        recipient: recipient
      ).event_notification.deliver_later
    end
  end

  def recipients_for(event, tournament)
    branch_admin_emails = Admin.where(branch_id: tournament.branch_id).pluck(:email)
    super_admin_emails = Admin.super_admin.pluck(:email)
    setting = Setting.find_by(branch_id: tournament.branch_id)

    registration_alert_recipients = []
    if event == "tournament_registration_created"
      registration_alert_recipients << setting&.tournament_registration_admin_email
      if setting&.send_registration_alerts_to_global_recipient?
        registration_alert_recipients << GLOBAL_REGISTRATION_ALERT_EMAIL
      end
    end

    (branch_admin_emails + super_admin_emails + registration_alert_recipients)
      .compact
      .map(&:strip)
      .reject(&:blank?)
      .uniq
  end

  def active_channels
    raw = ENV.fetch("TOURNAMENT_NOTIFICATION_CHANNELS", "log")
    raw.split(",").map(&:strip).reject(&:blank?).uniq
  end
end
