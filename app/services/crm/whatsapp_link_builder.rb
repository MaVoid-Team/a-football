require "erb"

module Crm
  class WhatsappLinkBuilder
    def initialize(phone:, message:)
      @phone = phone.to_s.gsub(/\D/, "")
      @message = message.to_s
    end

    def call
      return nil if @phone.blank? || @message.blank?

      encoded = ERB::Util.url_encode(@message)
      "https://wa.me/#{@phone}?text=#{encoded}"
    end
  end
end
