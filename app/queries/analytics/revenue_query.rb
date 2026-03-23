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
        outstanding_balance: query.where.not(payment_status: [:paid, :refunded]).sum(:amount_remaining)
      }
    end

    private

    def filtered_scope
      query = @scope
      from = @params[:from].presence
      to = @params[:to].presence

      if from.blank? && to.blank? && @params[:days].present?
        days = @params[:days].to_i
        days = 30 if days <= 0
        from = days.days.ago.to_date
        to = Date.current
      end

      query = query.where("date >= ?", from) if from.present?
      query = query.where("date <= ?", to) if to.present?
      query
    end
  end
end
