module Paginatable
  extend ActiveSupport::Concern

  private

  def paginate(scope)
    page = [params.fetch(:page, 1).to_i, 1].max
    per_page = [[params.fetch(:per_page, 25).to_i, 1].max, 100].min

    total = scope.reorder(nil).count
    total = total.length if total.is_a?(Hash)

    response.set_header("X-Total-Count", total.to_s)
    response.set_header("X-Page", page.to_s)
    response.set_header("X-Per-Page", per_page.to_s)
    response.set_header("X-Total-Pages", (total.to_f / per_page).ceil.to_s)

    scope.limit(per_page).offset((page - 1) * per_page)
  end
end
