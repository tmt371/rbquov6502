// File: 04-core-code/services/workflow-service.js

import * as uiActions from '../actions/ui-actions.js';
import { EVENTS } from '../config/constants.js';

export class WorkflowService {
    constructor({ stateService, eventAggregator, configManager }) {
        this.stateService = stateService;
        this.eventAggregator = eventAggregator;
        this.configManager = configManager;
    }

    _publishStateChange() {
        this.eventAggregator.publish(EVENTS.STATE_CHANGED, this.stateService.getState());
    }

    handleFocusCell({ rowIndex, column }) {
        const { ui } = this.stateService.getState();
        const { activeCell } = ui;

        if (activeCell && activeCell.rowIndex === rowIndex && activeCell.column === column) {
            return; // Don't re-dispatch if the cell is already active
        }
        
        this.stateService.dispatch(uiActions.setActiveCell(rowIndex, column));
        this.stateService.dispatch(uiActions.clearInputValue());
        this._publishStateChange();
    }

    handleStateChange(state) {
        const { ui, quoteData } = state;
        const { activeTabId } = ui;
        const productKey = quoteData.currentProduct;
        const productData = quoteData.products[productKey];

        if (activeTabId === 'f2-summary-tab') {
            const f2Config = this.configManager.getF2Config();
            this.stateService.dispatch(uiActions.setF2Value('totalPrice', productData.summary.totalPrice));
            this.stateService.dispatch(uiActions.setF2Value('totalCount', productData.summary.totalCount));
            
            const accessories = productData.summary.accessories;
            const accessoryFee = (accessories.winder || 0) + 
                                 (accessories.motor || 0) + 
                                 (accessories.remote || 0) +
                                 (accessories.charger || 0) +
                                 (accessories.cord || 0);

            this.stateService.dispatch(uiActions.setF2Value('accessoryFee', accessoryFee));

            const calculateFee = (base, rate, min, isExcluded) => {
                if (isExcluded) return 0;
                const calculated = base * (rate / 100);
                return Math.max(calculated, min);
            };
            
            const subtotal = productData.summary.totalPrice + accessoryFee;
            this.stateService.dispatch(uiActions.setF2Value('subtotal', subtotal));

            const managementFee = calculateFee(subtotal, f2Config.managementFeeRate, f2Config.managementFeeMin, ui.f2.managementFeeExcluded);
            this.stateService.dispatch(uiActions.setF2Value('managementFee', managementFee));

            const designFee = calculateFee(subtotal, f2Config.designFeeRate, f2Config.designFeeMin, ui.f2.designFeeExcluded);
            this.stateService.dispatch(uiActions.setF2Value('designFee', designFee));
            
            const subtotalAfterFees = subtotal + managementFee + designFee;
            this.stateService.dispatch(uiActions.setF2Value('subtotalAfterFees', subtotalAfterFees));
            
            const tax = ui.f2.taxFeeExcluded ? 0 : subtotalAfterFees * (f2Config.taxRate / 100);
            this.stateService.dispatch(uiActions.setF2Value('tax', tax));

            const total = subtotalAfterFees + tax;
            this.stateService.dispatch(uiActions.setF2Value('total', total));

            this._publishStateChange();
        }
    }

    handleRightPanelTabChange({ tabId }) {
        this.stateService.dispatch(uiActions.setActiveTab(tabId));
        this._publishStateChange();
    }
}