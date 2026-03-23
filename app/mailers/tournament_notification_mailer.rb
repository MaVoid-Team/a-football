class TournamentNotificationMailer < ApplicationMailer
  def event_notification
    @event = params[:event].to_s
    @tournament = params[:tournament]
    @payload = (params[:payload] || {}).deep_symbolize_keys
    @status_label = @payload[:status].to_s.humanize

    mail(to: params[:recipient], subject: subject_for_event)
  end

  private

  def subject_for_event
    base = "Tournament Update: #{@tournament.name}"

    case @event
    when "tournament_registration_created"
      "#{base} - New Registration Pending Review"
    when "match_scored"
      "#{base} - Match Result Recorded"
    when "registration_status_changed"
      "#{base} - Registration #{@status_label.presence || 'Status'}"
    else
      base
    end
  end
end
