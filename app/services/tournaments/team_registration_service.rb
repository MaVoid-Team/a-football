module Tournaments
  class TeamRegistrationService
    def initialize(tournament:, user:, team_params:)
      @tournament = tournament
      @user = user
      @team_params = team_params.to_h.symbolize_keys
    end

    def call
      return failure("authentication_required", "Authentication is required") if @user.blank?
      return failure("invalid_entry_mode", "This tournament does not accept team registrations") if @tournament.max_teams.blank?
      return failure("registration_closed", "Registration is closed") unless @tournament.registration_open?
      return failure("tournament_full", "Tournament is full") if @tournament.full_capacity?

      source_team = find_source_team
      return source_team if source_team.is_a?(ServiceResult) && source_team.failure?

      captain_player = build_captain_player
      teammate_player = build_teammate_player(source_team)

      return failure("duplicate_team_player", "Teammate must be different from captain") if teammate_player.phone == captain_player.phone

      registrations = nil
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

        captain_player.save! if captain_player.new_record? || captain_player.changed?
        teammate_player.save! if teammate_player.new_record? || teammate_player.changed?

        if registered_player_ids.include?(captain_player.id) || registered_player_ids.include?(teammate_player.id)
          transaction_error = failure("already_registered", "One of the players is already registered")
          raise ActiveRecord::Rollback
        end

        tournament_team = @tournament.tournament_teams.create!(
          name: source_team.name.presence || "#{@user.name} Team",
          player1: captain_player,
          player2: teammate_player,
          status: :pending
        )

        registrations = [
          @tournament.tournament_registrations.create!(player: captain_player, team: tournament_team, status: :pending),
          @tournament.tournament_registrations.create!(player: teammate_player, team: tournament_team, status: :pending)
        ]
      rescue ActiveRecord::Rollback
        registrations = nil
      end

      return transaction_error if transaction_error
      return failure("already_registered", "One of the players is already registered") if registrations.blank?

      registrations.each do |registration|
        Crm::ActivityLogger.new(
          player: registration.player,
          activity_type: "tournament_join",
          reference: registration,
          branch_id: @tournament.branch_id,
          metadata: {
            tournament_id: @tournament.id,
            registration_id: registration.id,
            team_id: registration.team_id,
            player_name: registration.player.name,
            player_phone: registration.player.phone
          }
        ).call
      end

      source_team.save! if @team_params[:user_team_id].blank? && ActiveModel::Type::Boolean.new.cast(@team_params[:save_team])

      ServiceResult.success(registrations.first)
    rescue ActiveRecord::RecordInvalid => e
      ServiceResult.failure(e.record.errors.full_messages, error_codes: ["team_registration_invalid"])
    rescue ActiveRecord::RecordNotFound
      failure("saved_team_not_found", "Saved team not found")
    end

    private

    def find_source_team
      return @user.user_teams.find(@team_params[:user_team_id]) if @team_params[:user_team_id].present?

      team = @user.user_teams.new(
        name: @team_params[:team_name],
        teammate_name: @team_params[:teammate_name],
        teammate_phone: @team_params[:teammate_phone],
        teammate_email: @team_params[:teammate_email],
        teammate_skill_level: @team_params[:teammate_skill_level].presence || "intermediate"
      )
      return ServiceResult.failure(team.errors.full_messages, error_codes: ["saved_team_invalid"]) unless team.valid?

      team
    end

    def build_captain_player
      @tournament.tournament_players.find_or_initialize_by(user_id: @user.id).tap do |player|
        player.assign_attributes(
          name: @user.name,
          phone: @user.phone,
          email: @user.email,
          skill_level: @user.skill_level
        )
      end
    end

    def build_teammate_player(source_team)
      @tournament.tournament_players.find_or_initialize_by(phone: source_team.teammate_phone).tap do |player|
        player.assign_attributes(
          name: source_team.teammate_name,
          email: source_team.teammate_email,
          skill_level: source_team.teammate_skill_level
        )
      end
    end

    def registered_player_ids
      @registered_player_ids ||= @tournament.tournament_registrations.select(:player_id).pluck(:player_id)
    end

    def failure(code, message)
      ServiceResult.failure(message, error_codes: [code])
    end
  end
end
