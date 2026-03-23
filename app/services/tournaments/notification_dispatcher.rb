module Tournaments
  class NotificationDispatcher
    def self.dispatch(event:, tournament:, payload: {})
      TournamentEventNotificationJob.perform_later(
        event.to_s,
        tournament.id,
        payload.to_h
      )
    end
  end
end
