"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const wallet_router_1 = __importDefault(require("./routes/wallet_router"));
const wallet_operation_router_1 = __importDefault(require("./routes/wallet_operation_router"));
const annotation_router_1 = __importDefault(require("./routes/annotation_router"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ credentials: true, origin: true }));
// Add your routes here
app.use('/wallet', wallet_router_1.default);
app.use('/wallet_operation', wallet_operation_router_1.default);
app.use('/annotation', annotation_router_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map