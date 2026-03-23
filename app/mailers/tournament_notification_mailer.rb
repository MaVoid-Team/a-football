class TournamentNotificationMailer < ApplicationMailer
  def event_notification
    @event = params[:event].to_s
    @tournament = params[:tournament]
    @payload = (params[:payload] || {}).deep_symbolize_keys

    mail(to: params[:recipient], subject: subject_for_event)
  end

  private

  def subject_for_event
    base = "Tournament Update: #{@tournament.name}"

    case @event
    when "match_scored"
      "#{base} - Match Result Recorded"
    when "registration_status_changed"
      "#{base} - Registration Status Updated"
    else
      base
    end
  end
end
