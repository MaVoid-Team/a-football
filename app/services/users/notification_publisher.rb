require "set"

module Users
  class NotificationPublisher
    class << self
      def registration_status_changed(registration)
        return unless registration.player&.user
        return unless %w[approved rejected].include?(registration.status)

        title = registration.approved? ? "Registration approved" : "Registration rejected"
        body =
          if registration.approved?
            "Your registration for #{registration.tournament.name} has been approved."
          else
            "Your registration for #{registration.tournament.name} has been rejected."
          end

        create_notification(
          user: registration.player.user,
          notification_type: "registration_status_changed",
          title: title,
          body: body,
          link_url: "/tournament/#{registration.tournament_id}",
          data: {
            tournament_id: registration.tournament_id,
            registration_id: registration.id,
            status: registration.status
          }
        )
      end

      def match_scheduled(match)
        return if match.scheduled_time.blank?

        notified_user_ids = Set.new
        [match.team1, match.team2].compact.each do |team|
          [team.player1, team.player2].compact.each do |player|
            user = player.user
            next if user.blank? || notified_user_ids.include?(user.id)

            opponent = team.id == match.team1_id ? match.team2 : match.team1
            create_notification(
              user: user,
              notification_type: "match_scheduled",
              title: "Match scheduled",
              body: "#{match.tournament.name}: #{opponent&.name.present? ? "vs #{opponent.name}" : "new match"} on #{match.scheduled_time.strftime('%b %-d, %Y at %H:%M')}.",
              link_url: "/tournament/#{match.tournament_id}/live",
              data: {
                tournament_id: match.tournament_id,
                match_id: match.id,
                scheduled_time: match.scheduled_time,
                court_id: match.court_id
              }
            )
            notified_user_ids << user.id
          end
        end
      end

      private

      def create_notification(user:, notification_type:, title:, body:, link_url:, data:)
        UserNotification.create!(
          user: user,
          notification_type: notification_type,
          title: title,
          body: body,
          link_url: link_url,
          data: data
        )
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.error("[UserNotification] failed user_id=#{user.id} type=#{notification_type} error=#{e.message}")
      end
    end
  end
end
