module Crm
  class SegmentEvaluator
    def initialize(segment:, player:)
      @segment = segment
      @player = player
    end

    def match?
      conditions = @segment.conditions.to_h
      rules = Array(conditions["rules"])
      return false if rules.empty?

      operator = conditions["operator"].to_s == "any" ? :any? : :all?
      rules.public_send(operator) { |rule| rule_match?(rule.to_h) }
    end

    private

    def rule_match?(rule)
      field = rule["field"].to_s
      op = rule["op"].to_s
      value = rule["value"]

      case field
      when "last_activity_days"
        compare_numeric(last_activity_days, op, value)
      when "total_bookings"
        compare_numeric(@player.total_bookings.to_i, op, value)
      when "total_matches"
        compare_numeric(@player.total_matches.to_i, op, value)
      when "total_tournaments"
        compare_numeric(@player.total_tournaments.to_i, op, value)
      when "tags"
        compare_tags(@player.tags, op, value)
      else
        false
      end
    end

    def last_activity_days
      return 1_000_000 if @player.last_activity_date.blank?

      ((Time.current - @player.last_activity_date) / 1.day).floor
    end

    def compare_numeric(actual, op, expected)
      expected_num = expected.to_f

      case op
      when "gte" then actual >= expected_num
      when "lte" then actual <= expected_num
      when "eq" then actual == expected_num
      else false
      end
    end

    def compare_tags(actual_tags, op, expected)
      tags = Array(actual_tags).map(&:to_s)
      expected_tag = expected.to_s

      case op
      when "includes"
        tags.include?(expected_tag)
      when "excludes"
        !tags.include?(expected_tag)
      else
        false
      end
    end
  end
end
