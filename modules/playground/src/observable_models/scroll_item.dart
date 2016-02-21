library benchmarks.src.naive_infinite_scroll.scroll_item;

import "cells.dart"
    show
        CompanyNameComponent,
        OpportunityNameComponent,
        OfferingNameComponent,
        StageButtonsComponent,
        AccountCellComponent,
        FormattedCellComponent;
import "package:angular2/angular2.dart" show Component, Directive, View, ChangeDetectionStrategy;
import "common.dart"
    show
        Offering,
        ITEM_HEIGHT,
        COMPANY_NAME_WIDTH,
        OPPORTUNITY_NAME_WIDTH,
        OFFERING_NAME_WIDTH,
        ACCOUNT_CELL_WIDTH,
        BASE_POINTS_WIDTH,
        KICKER_POINTS_WIDTH,
        STAGE_BUTTONS_WIDTH,
        BUNDLES_WIDTH,
        DUE_DATE_WIDTH,
        END_DATE_WIDTH,
        AAT_STATUS_WIDTH;

@Component(selector: "scroll-item", inputs: const ["offering"],
  changeDetection: ChangeDetectionStrategy.OnPushObserve)
@View(
    directives: const [
  CompanyNameComponent,
  OpportunityNameComponent,
  OfferingNameComponent,
  StageButtonsComponent,
  AccountCellComponent,
  FormattedCellComponent
],
    template: '''
    <div class="row"
      [style.height.px]="itemHeight"
      [style.line-height.px]="itemHeight"
      style="font-size: 18px; display: flex; justify-content: space-between;">
        <company-name [company]="offering.company"
                      [cell-width]="companyNameWidth">
        </company-name>
        <opportunity-name [opportunity]="offering.opportunity"
                          [cell-width]="opportunityNameWidth">
        </opportunity-name>
        <offering-name [offering]="offering"
                       [cell-width]="offeringNameWidth">
        </offering-name>
        <account-cell [account]="offering.account"
                      [cell-width]="accountCellWidth">
        </account-cell>
        <formatted-cell [value]="offering.basePoints"
                        [cell-width]="basePointsWidth">
        </formatted-cell>
        <formatted-cell [value]="offering.kickerPoints"
                        [cell-width]="kickerPointsWidth">
        </formatted-cell>
        <stage-buttons [offering]="offering"
                       [cell-width]="stageButtonsWidth">
        </stage-buttons>
        <formatted-cell [value]="offering.bundles"
                        [cell-width]="bundlesWidth">
        </formatted-cell>
        <formatted-cell [value]="offering.dueDate"
                        [cell-width]="dueDateWidth">
        </formatted-cell>
        <formatted-cell [value]="offering.endDate"
                        [cell-width]="endDateWidth">
        </formatted-cell>
        <formatted-cell [value]="offering.aatStatus"
                        [cell-width]="aatStatusWidth">
        </formatted-cell>
    </div>''')
class ScrollItemComponent {
  Offering offering;
  num itemHeight;
  ScrollItemComponent() {
    this.itemHeight = ITEM_HEIGHT;
  }
  get companyNameWidth {
    return COMPANY_NAME_WIDTH;
  }
  get opportunityNameWidth {
    return OPPORTUNITY_NAME_WIDTH;
  }
  get offeringNameWidth {
    return OFFERING_NAME_WIDTH;
  }
  get accountCellWidth {
    return ACCOUNT_CELL_WIDTH;
  }
  get basePointsWidth {
    return BASE_POINTS_WIDTH;
  }
  get kickerPointsWidth {
    return KICKER_POINTS_WIDTH;
  }
  get stageButtonsWidth {
    return STAGE_BUTTONS_WIDTH;
  }
  get bundlesWidth {
    return BUNDLES_WIDTH;
  }
  get dueDateWidth {
    return DUE_DATE_WIDTH;
  }
  get endDateWidth {
    return END_DATE_WIDTH;
  }
  get aatStatusWidth {
    return AAT_STATUS_WIDTH;
  }
}
