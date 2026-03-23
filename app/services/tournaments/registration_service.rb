module Tournaments
  class RegistrationService
    def initialize(tournament:, registration_params:)
      @tournament = tournament
      @registration_params = registration_params
    end

    def call
      return failure("registration_closed", "Registration is closed") unless @tournament.registration_open?
      return failure("tournament_full", "Tournament is full") if @tournament.full_capacity?

      player = build_player
      return ServiceResult.failure(player.errors.full_messages, error_codes: ["player_invalid"]) unless player.valid?

      duplicate = if player.persisted?
                    @tournament.tournament_registrations.exists?(player_id: player.id)
                  else
                    false
                  end
      return failure("already_registered", "Already registered") if duplicate

      registration = nil
      transaction_error = nil
      ActiveRecord::Base.transaction do
        @tournament.lock!

        unless @tournament.registration_open?
          transaction_error = failure("registration_closed", "Registration is closed")
          raise ActiveRecord::Rollback
        end

        if @tournament.full_capacity?
          transaction_error = failure("tournament_full", "Tournament is full")
          raise ActiveRecord::Rollback
        end

        player.save! if player.new_record? || player.changed?
        registration = @tournament.tournament_registrations.create!(
          player: player,
          status: :pending
        )
      end

      return transaction_error if transaction_error

      ServiceResult.success(registration)
    rescue ActiveRecord::RecordNotUnique
      failure("already_registered", "Already registered")
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages, error_codes: ["registration_invalid"])
    end

    private

    def build_player
      params = normalized_params
      if params[:user_id].present?
        @tournament.tournament_players.find_or_initialize_by(user_id: params[:user_id]).tap do |player|
          player.assign_attributes(params.slice(:name, :phone, :skill_level))
        end
      else
        @tournament.tournament_players.find_or_initialize_by(phone: params[:phone]).tap do |player|
          player.assign_attributes(params.slice(:name, :skill_level))
        end
      end
    end

    def normalized_params
      @normalized_params ||= begin
        skill = @registration_params[:skill_level].presence || "intermediate"
        @registration_params.to_h.symbolize_keys.merge(skill_level: skill)
      end
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end
  end
end
