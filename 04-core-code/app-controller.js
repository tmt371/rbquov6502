// File: 04-core-code/app-controller.js

import { EventAggregator } from './event-aggregator.js';
import { EVENTS } from './config/constants.js';
import { QuickQuoteView } from './ui/views/quick-quote-view.js';
import { DetailConfigView } from './ui/views/detail-config-view.js';
import { F1CostView } from './ui/views/f1-cost-view.js';
import { F2SummaryView } from './ui/views/f2-summary-view.js';
import { F3QuotePrepView } from './ui/views/f3-quote-prep-view.js';
import { F4ActionsView } from './ui/views/f4-actions-view.js';

/**
 * @fileoverview AppController acts as the central event router for the application.
 * It listens for semantic events and delegates them to the appropriate view logic module or service.
 * It is responsible for orchestrating the overall application flow based on user interactions.
 */
export class AppController {
    constructor(dependencies) {
        this.stateService = dependencies.stateService;
        this.workflowService = dependencies.workflowService;
        this.eventAggregator = dependencies.eventAggregator;
        this.calculationService = dependencies.calculationService;
        this.focusService = dependencies.focusService;
        this.fileService = dependencies.fileService;
        this.productFactory = dependencies.productFactory;
        this.configManager = dependencies.configManager;

        // Initialize Views
        const commonViewDeps = {
            stateService: this.stateService,
            calculationService: this.calculationService,
            focusService: this.focusService,
            fileService: this.fileService,
            eventAggregator: this.eventAggregator,
            productFactory: this.productFactory,
            configManager: this.configManager,
            publishStateChangeCallback: this._publishStateChange.bind(this)
        };
        
        this.views = {
            quickQuote: new QuickQuoteView(commonViewDeps),
            detailConfig: new DetailConfigView(commonViewDeps),
            f1Cost: new F1CostView(commonViewDeps),
            f2Summary: new F2SummaryView(commonViewDeps),
            f3QuotePrep: new F3QuotePrepView(commonViewDeps),
            f4Actions: new F4ActionsView(commonViewDeps)
        };

        this._registerEventListeners();
    }

    _getFullState() {
        return this.stateService.getState();
    }

    _publishStateChange() {
        this.eventAggregator.publish(EVENTS.STATE_CHANGED, this._getFullState());
    }

    publishInitialState() {
        this._publishStateChange();
    }

    _registerEventListeners() {
        // High-level UI events
        this.eventAggregator.subscribe(EVENTS.FOCUS_CELL, (data) => this.workflowService.handleFocusCell(data));
        this.eventAggregator.subscribe(EVENTS.STATE_CHANGED, (state) => this.workflowService.handleStateChange(state));

        // Quick Quote View events
        this.eventAggregator.subscribe(EVENTS.NUMERIC_KEY_PRESSED, (data) => this.views.quickQuote.handleNumericKeyPress(data));
        this.eventAggregator.subscribe(EVENTS.TABLE_CELL_CLICKED, (data) => this.views.quickQuote.handleTableCellClick(data));
        this.eventAggregator.subscribe(EVENTS.SEQUENCE_CELL_CLICKED, (data) => this.views.quickQuote.handleSequenceCellClick(data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CALCULATE_AND_SUM, () => this.views.quickQuote.handleCalculateAndSum());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CYCLE_TYPE, () => this.views.quickQuote.handleCycleType());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_MULTI_TYPE_SET, () => this.views.quickQuote.handleMultiTypeSet());
        this.eventAggregator.subscribe(EVENTS.TYPE_BUTTON_LONG_PRESSED, () => this.views.quickQuote.handleTypeButtonLongPress());
        this.eventAggregator.subscribe(EVENTS.TYPE_CELL_LONG_PRESSED, (data) => this.views.quickQuote.handleTypeCellLongPress(data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CLEAR_ROW, () => this.views.quickQuote.handleClearRow());
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_INSERT_ROW, () => this.views.quickQuote.handleInsertRow());
        this.eventAggregator.subscribe(EVENTS.USER_MOVED_ACTIVE_CELL, (data) => this.views.quickQuote.handleMoveActiveCell(data));

        // Detail Config View events
        this.eventAggregator.subscribe(EVENTS.LEFT_PANEL_TAB_CHANGED, (data) => this.views.detailConfig.handleTabChange(data));
        this.eventAggregator.subscribe(EVENTS.DETAIL_VIEW_EDIT_REQUESTED, (data) => this.views.detailConfig.handleEditRequest(data));
        this.eventAggregator.subscribe(EVENTS.DETAIL_VIEW_SAVE_REQUESTED, (data) => this.views.detailConfig.handleSaveRequest(data));
        this.eventAggregator.subscribe(EVENTS.LF_SELECTION_CHANGED, (data) => this.views.detailConfig.handleLfSelectionChange(data));
        this.eventAggregator.subscribe(EVENTS.LF_FABRIC_SET_REQUESTED, () => this.views.detailConfig.handleLfFabricSetRequest());
        this.eventAggregator.subscribe(EVENTS.LF_FABRIC_CLEAR_REQUESTED, () => this.views.detailConfig.handleLfFabricClearRequest());
        this.eventAggregator.subscribe(EVENTS.K3_TABLE_CELL_CLICKED, (data) => this.views.detailConfig.handleK3TableCellClick(data));
        this.eventAggregator.subscribe(EVENTS.K3_BATCH_SET_REQUESTED, (data) => this.views.detailConfig.handleK3BatchSetRequest(data));
        this.eventAggregator.subscribe(EVENTS.DUAL_CHAIN_MODE_CHANGED, (data) => this.views.detailConfig.handleDualChainModeChange(data));
        this.eventAggregator.subscribe(EVENTS.DUAL_CHAIN_VALUE_ENTERED, (data) => this.views.detailConfig.handleDualChainValueEntered(data));
        this.eventAggregator.subscribe(EVENTS.DRIVE_ACCESSORY_MODE_CHANGED, (data) => this.views.detailConfig.handleDriveAccessoryModeChange(data));
        this.eventAggregator.subscribe(EVENTS.DRIVE_ACCESSORY_VALUE_ENTERED, (data) => this.views.detailConfig.handleDriveAccessoryValueEntered(data));

        // F1-F4 View events
        this.eventAggregator.subscribe(EVENTS.RIGHT_PANEL_TAB_CHANGED, (data) => this.workflowService.handleRightPanelTabChange(data));
        this.eventAggregator.subscribe(EVENTS.F1_CALCULATE_CLICKED, () => this.views.f1Cost.handleCalculateClick());
        this.eventAggregator.subscribe(EVENTS.F1_DISCOUNT_CHANGED, (data) => this.views.f1Cost.handleDiscountChange(data));
        this.eventAggregator.subscribe(EVENTS.F2_FEE_EXCLUSION_TOGGLED, (data) => this.views.f2Summary.handleFeeExclusionToggle(data));
        this.eventAggregator.subscribe(EVENTS.F2_USER_VALUE_CHANGED, (data) => this.views.f2Summary.handleUserValueChanged(data));
        this.eventAggregator.subscribe(EVENTS.F4_SAVE_TO_FILE_CLICKED, () => this.views.quickQuote.handleSaveToFile()); // Re-use from quickQuote
        this.eventAggregator.subscribe(EVENTS.F4_LOAD_FROM_FILE_CLICKED, () => this.eventAggregator.publish(EVENTS.TRIGGER_FILE_LOAD));
        this.eventAggregator.subscribe(EVENTS.F4_EXPORT_CSV_CLICKED, () => this.views.quickQuote.handleExportCSV()); // Re-use from quickQuote
        this.eventAggregator.subscribe(EVENTS.F4_RESET_QUOTE_CLICKED, () => this.views.quickQuote.handleReset()); // Re-use from quickQuote
        this.eventAggregator.subscribe(EVENTS.F4_SAVE_THEN_LOAD_CLICKED, () => this.views.quickQuote.handleSaveThenLoad()); // Re-use from quickQuote
    }
}