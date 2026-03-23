module Crm
  class PlayerProjectionUpdater
    COUNTER_FIELDS = {
      "booking" => :total_bookings,
      "tournament_join" => :total_tournaments,
      "match_played" => :total_matches
    }.freeze

    def initialize(player:, activity_type:, activity_time: Time.current, add_tags: [])
      @player = player
      @activity_type = activity_type.to_s
      @activity_time = activity_time
      @add_tags = Array(add_tags).map { |tag| normalize_tag(tag) }.compact
    end

    def call
      return if @player.blank?

      attrs = { last_activity_date: @activity_time }
      counter_field = COUNTER_FIELDS[@activity_type]
      attrs[counter_field] = @player.public_send(counter_field).to_i + 1 if counter_field.present?

      if @add_tags.any?
        attrs[:tags] = (@player.tags + @add_tags).uniq
      end

      @player.update!(attrs)
    end

    private

    def normalize_tag(tag)
      value = tag.to_s.strip.downcase
      value.presence
    end
  end
end
