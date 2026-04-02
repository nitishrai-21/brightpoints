# app/api/utils.py
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError

def validation_error(message: str):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder({
            "error_type": "validation",
            "message": message
        })
    )

def pydantic_error_response(exc: ValidationError):
    errors = {}
    for err in exc.errors():
        # use 'loc' to get the field name, convert alias to frontend name
        field = err["loc"][-1]  # last item is the field
        msg = err["msg"]
        errors[field] = msg
    return JSONResponse(status_code=422, content={"errors": errors})