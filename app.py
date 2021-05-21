import json
import pickle


from flask import Flask, render_template, request, url_for, redirect, Response,jsonify,make_response

# from database import create_tabel

app = Flask(__name__)

@app.route("/start",methods=["GET","POST"])
def start():
    flag=request.args.get("id")
    from bsedata.bse import BSE
    b = BSE()
    b = BSE(update_codes=True)

    def getBSEData(s):
        q = b.getQuote(s)
        print(q)
        return q

    return getBSEData(flag)
if __name__ == '__main__':
    app.run(debug=True)