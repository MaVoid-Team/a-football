class ApplicationPolicy
  attr_reader :admin, :record

  def initialize(admin, record)
    @admin = admin
    @record = record
  end

  def index?
    admin.present?
  end

  def show?
    scope_includes_record?
  end

  def create?
    admin.present?
  end

  def update?
    scope_includes_record?
  end

  def destroy?
    admin&.super_admin?
  end

  private

  def super_admin?
    admin&.super_admin?
  end

  def branch_admin?
    admin&.branch_admin?
  end

  def own_branch?(resource = record)
    return true if super_admin?
    resource.respond_to?(:branch_id) && resource.branch_id == admin.branch_id
  end

  def scope_includes_record?
    Scope.new(admin, record.class).resolve.exists?(id: record.id)
  end

  class Scope
    attr_reader :admin, :scope

    def initialize(admin, scope)
      @admin = admin
      @scope = scope
    end

    def resolve
      if admin.super_admin?
        scope.all
      else
        scope.where(branch_id: admin.branch_id)
      end
    end
  end
end
