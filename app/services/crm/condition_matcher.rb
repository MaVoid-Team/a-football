module Crm
  class ConditionMatcher
    OPERATOR_MAP = {
      ">=" => :>=,
      ">" => :>,
      "<=" => :<=,
      "<" => :<,
      "=" => :==,
      "==" => :==
    }.freeze

    def initialize(player:, conditions:)
      @player = player
      @conditions = conditions.to_h
    end

    def match?
      return match_rule_array if @conditions["rules"].is_a?(Array)

      match_compact_hash
    end

    private

    def match_rule_array
      rules = Array(@conditions["rules"]).map(&:to_h)
      return false if rules.empty?

      operator = @conditions["operator"].to_s == "any" ? :any? : :all?
      rules.public_send(operator) do |rule|
        compare_field(rule["field"].to_s, rule["op"].to_s, rule["value"])
      end
    end

    def match_compact_hash
      return false if @conditions.blank?

      @conditions.all? do |field, expression|
        field = field.to_s

        if field == "tags"
          compare_tags("includes", expression)
        else
          op, value = parse_expression(expression)
          compare_field(field, op, value)
        end
      end
    end

    def parse_expression(expression)
      value = expression.to_s.strip
      OPERATOR_MAP.each_key do |operator|
        next unless value.start_with?(operator)

        return [operator_to_rule(operator), value.delete_prefix(operator).strip]
      end

      ["eq", value]
    end

    def operator_to_rule(operator)
      case operator
      when ">" then "gt"
      when ">=" then "gte"
      when "<" then "lt"
      when "<=" then "lte"
      when "=", "==" then "eq"
      else "eq"
      end
    end

    def compare_field(field, op, expected)
      case field
      when "last_activity_days"
        compare_numeric(last_activity_days, op, expected)
      when "total_bookings"
        compare_numeric(@player.total_bookings.to_i, op, expected)
      when "total_matches"
        compare_numeric(@player.total_matches.to_i, op, expected)
      when "total_tournaments"
        compare_numeric(@player.total_tournaments.to_i, op, expected)
      when "no_show_count"
        compare_numeric(@player.no_show_count.to_i, op, expected)
      when "cancellation_count"
        compare_numeric(@player.cancellation_count.to_i, op, expected)
      when "tags"
        compare_tags(op, expected)
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
      when "gt" then actual > expected_num
      when "gte" then actual >= expected_num
      when "lt" then actual < expected_num
      when "lte" then actual <= expected_num
      when "eq" then actual == expected_num
      else false
      end
    end

    def compare_tags(op, expected)
      tags = Array(@player.tags).map(&:to_s)
      expected_tag = expected.to_s

      case op
      when "includes"
        tags.include?(expected_tag)
      when "excludes"
        !tags.include?(expected_tag)
      else
        tags.include?(expected_tag)
      end
    end
  end
end
