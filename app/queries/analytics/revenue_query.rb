module Analytics
  class RevenueQuery
    def initialize(scope:, params: {})
      @scope = scope
      @params = params
    end

    def call
      query = @scope.confirmed.where(payment_status: :paid)
      query = query.where("date >= ?", @params[:from]) if @params[:from].present?
      query = query.where("date <= ?", @params[:to]) if @params[:to].present?
      query.sum(:total_price)
    end
  end
end
