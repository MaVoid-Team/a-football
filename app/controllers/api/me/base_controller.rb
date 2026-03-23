module Api
  module Me
    class BaseController < Api::BaseController
      include UserAuthenticatable
    end
  end
end
