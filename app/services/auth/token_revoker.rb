module Auth
  class TokenRevoker
    def self.revoke!(token)
      return if token.blank?

      decoded = JsonWebToken.decode(token)
      ttl = decoded[:exp].to_i - Time.current.to_i
      return if ttl <= 0

      REDIS.setex("revoked_token:#{Digest::SHA256.hexdigest(token)}", ttl, "1")
    end
  end
end
