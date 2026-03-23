module Crm
  class ActivityLogger
    def initialize(player:, activity_type:, reference: nil, metadata: {}, branch_id: nil, actor_admin: nil, activity_time: Time.current, add_tags: [])
      @player = player
      @activity_type = activity_type
      @reference = reference
      @metadata = metadata || {}
      @branch_id = branch_id
      @actor_admin = actor_admin
      @activity_time = activity_time
      @add_tags = add_tags
    end

    def call
      log = ActivityLog.create!(
        player: @player,
        activity_type: @activity_type,
        reference: @reference,
        branch_id: resolve_branch_id,
        actor_admin: @actor_admin,
        metadata: @metadata,
        created_at: @activity_time,
        updated_at: @activity_time
      )

      Crm::PlayerProjectionUpdater.new(
        player: @player,
        activity_type: @activity_type,
        activity_time: @activity_time,
        add_tags: @add_tags
      ).call

      log
    rescue StandardError => e
      Rails.logger.error("[CRM][ActivityLogger] #{e.class}: #{e.message}")
      nil
    end

    private

    def resolve_branch_id
      return @branch_id if @branch_id.present?
      return @reference.branch_id if @reference.respond_to?(:branch_id)

      if @reference.respond_to?(:tournament) && @reference.tournament.respond_to?(:branch_id)
        return @reference.tournament.branch_id
      end

      nil
    end
  end
end
