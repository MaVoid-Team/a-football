module Auth
  class JsonWebToken
    SECRET_KEY = Rails.application.secret_key_base

    def self.encode(payload, exp = 24.hours.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, SECRET_KEY)
    end

    def self.decode(token)
      decoded = JWT.decode(token, SECRET_KEY)[0]
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::ExpiredSignature
      raise Auth::AuthenticationError, "Token has expired"
    rescue JWT::DecodeError => e
      message = decode_error_message(e.message)
      raise Auth::AuthenticationError, message
    end

    def self.decode_error_message(jwt_message)
      case jwt_message
      when /not enough|too many segments/i
        "Invalid or malformed token"
      when /signature/i
        "Invalid token signature"
      else
        "Invalid token"
      end
    end
  end

  class AuthenticationError < StandardError; end
end
