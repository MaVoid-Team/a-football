module Crm
  class PlayersQuery
    def initialize(admin:, params: {})
      @admin = admin
      @params = params
    end

    def call
      entries = Crm::PlayerScope.new(admin: @admin).all_entries
      records = entries.map { |entry| serialize_player(entry.type, entry.record) }

      records = filter_by_search(records)
      records = filter_by_status(records)
      records = filter_by_tags(records)
      records = filter_by_segment(records)
      records = sort_records(records)

      paginate(records)
    end

    private

    def serialize_player(player_type, player)
      {
        key: "#{player_type}-#{player.id}",
        player_type: player_type,
        player_id: player.id,
        name: player.name,
        phone: player.phone,
        email: player.email,
        skill_level: player.skill_level,
        last_activity_date: player.last_activity_date,
        total_bookings: player.total_bookings.to_i,
        total_matches: player.total_matches.to_i,
        total_tournaments: player.total_tournaments.to_i,
        tags: player.tags || []
      }
    end

    def filter_by_search(records)
      query = @params[:search].to_s.strip.downcase
      return records if query.blank?

      records.select do |record|
        [record[:name], record[:phone], record[:email]].compact.any? { |value| value.to_s.downcase.include?(query) }
      end
    end

    def filter_by_status(records)
      status = @params[:status].to_s
      return records if status.blank?

      case status
      when "active"
        records.select { |record| record[:last_activity_date].present? && record[:last_activity_date] >= 7.days.ago }
      when "inactive"
        records.select { |record| record[:last_activity_date].blank? || record[:last_activity_date] <= 30.days.ago }
      else
        records
      end
    end

    def filter_by_tags(records)
      raw_tags = @params[:tags]
      tags =
        case raw_tags
        when String
          raw_tags.split(",")
        when Array
          raw_tags
        else
          []
        end.map { |tag| tag.to_s.strip.downcase }.reject(&:blank?)

      return records if tags.empty?

      records.select { |record| (record[:tags] & tags).any? }
    end

    def filter_by_segment(records)
      segment_id = @params[:segment_id]
      return records if segment_id.blank?

      segment = Segment.active_only.find_by(id: segment_id)
      return [] if segment.blank?

      records.select do |record|
        player = record[:player_type].constantize.find_by(id: record[:player_id])
        next false if player.blank?

        Crm::SegmentEvaluator.new(segment: segment, player: player).match?
      end
    end

    def sort_records(records)
      records.sort_by { |record| [record[:last_activity_date] || Time.at(0), record[:total_bookings], record[:name].to_s] }.reverse
    end

    def paginate(records)
      page = @params[:page].to_i
      per_page = @params[:per_page].to_i
      page = 1 if page <= 0
      per_page = 20 if per_page <= 0

      total_count = records.size
      total_pages = (total_count.to_f / per_page).ceil
      paged = records.slice((page - 1) * per_page, per_page) || []

      {
        data: paged,
        meta: {
          total_count: total_count,
          page: page,
          per_page: per_page,
          total_pages: total_pages
        }
      }
    end
  end
end
