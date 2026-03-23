module Crm
  class TemplateRenderer
    ALLOWED_VARIABLES = %w[name club_name].freeze

    def initialize(content:, variables: {})
      @content = content.to_s
      @variables = variables.to_h.stringify_keys
    end

    def call
      rendered = @content.dup

      ALLOWED_VARIABLES.each do |key|
        rendered.gsub!("{#{key}}", @variables[key].to_s)
      end

      rendered
    end
  end
end
