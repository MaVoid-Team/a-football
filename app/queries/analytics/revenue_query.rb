module Analytics
  class RevenueQuery
    def initialize(scope:, params: {})
      @scope = scope
      @params = params
    end

    def call
      query = filtered_scope.confirmed

      {
        total_revenue: query.where(payment_status: :paid).sum(:total_price),
        collected_due_now: query.sum(:amount_due_now),
        outstanding_balance: query.sum(:amount_remaining)
      }
    end

    private

    def filtered_scope
      query = @scope
      query = query.where("date >= ?", @params[:from]) if @params[:from].present?
      query = query.where("date <= ?", @params[:to]) if @params[:to].present?
      query
    end
  end
end
