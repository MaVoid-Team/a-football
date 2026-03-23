class TournamentEventNotificationJob < ApplicationJob
  queue_as :notifications

  GLOBAL_REGISTRATION_ALERT_EMAIL = "z.ahmed@mavoid.com".freeze
  EMAIL_FORMAT = URI::MailTo::EMAIL_REGEXP

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
      begin
        TournamentNotificationMailer.with(
          event: event,
          tournament: tournament,
          payload: payload,
          recipient: recipient
        ).event_notification.deliver_later
      rescue StandardError => e
        Rails.logger.error(
          "[TournamentNotification] failed_to_enqueue_email event=#{event} tournament_id=#{tournament.id} " \
          "recipient=#{recipient} error_class=#{e.class} error=#{e.message}"
        )
      end
    end
  end

  def recipients_for(event, tournament)
    if event == "tournament_registration_created"
      return registration_alert_recipients_for(tournament)
    end

    branch_admin_emails = Admin.where(branch_id: tournament.branch_id).pluck(:email)
    super_admin_emails = Admin.super_admin.pluck(:email)

    normalize_emails(branch_admin_emails + super_admin_emails)
  end

  def active_channels
    raw = ENV.fetch("TOURNAMENT_NOTIFICATION_CHANNELS", "log")
    raw.split(",").map(&:strip).reject(&:blank?).uniq
  end

  def registration_alert_recipients_for(tournament)
    setting = Setting.find_by(branch_id: tournament.branch_id)
    recipients = [setting&.tournament_registration_admin_email]
    recipients << GLOBAL_REGISTRATION_ALERT_EMAIL if setting&.send_registration_alerts_to_global_recipient?

    normalize_emails(recipients)
  end

  def normalize_emails(emails)
    emails
      .compact
      .map { |email| email.to_s.strip.downcase }
      .reject(&:blank?)
      .select { |email| email.match?(EMAIL_FORMAT) }
      .uniq
  end
end
